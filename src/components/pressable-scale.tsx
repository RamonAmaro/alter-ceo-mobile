import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { View, ViewStyle, StyleProp, GestureResponderEvent } from "react-native";
import { Animated, Pressable } from "react-native";

// Feedback tátil sutil: ao pressionar, o botão encolhe levemente (0.92x) com
// opacidade atenuada. Ao soltar, volta ao estado normal com um spring suave.
// Usa `transform: scale` + `opacity` — ambos com `useNativeDriver: true`
// (animations.md).
//
// Implementação: `onPressIn` dispara a animação "pressed" e `onPressOut` a
// "released". No React Native Web esses dois eventos são gerados a partir de
// mouse/touch (pointerdown/pointerup) de forma confiável a partir do RN Web
// ~0.19 — o projeto está numa versão mais recente, então são estáveis.

const PRESSED_SCALE = 0.92;
const PRESSED_OPACITY = 0.85;
const SPRING_FRICTION = 6;
const SPRING_TENSION = 140;
const OPACITY_IN_MS = 80;
const OPACITY_OUT_MS = 140;

interface PressableScaleProps {
  readonly onPress?: (e: GestureResponderEvent) => void;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
  readonly hitSlop?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly children: React.ReactNode;
}

export const PressableScale = forwardRef<View, PressableScaleProps>(function PressableScale(
  { onPress, disabled, accessibilityLabel, hitSlop, style, children },
  ref,
) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [isPressPending, setIsPressPending] = useState(false);
  const isMountedRef = useRef(true);
  const pressLockedRef = useRef(false);
  const isDisabled = Boolean(disabled) || isPressPending;

  const animateTo = useCallback((pressed: boolean) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: pressed ? PRESSED_SCALE : 1,
        friction: SPRING_FRICTION,
        tension: SPRING_TENSION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: pressed ? PRESSED_OPACITY : 1,
        duration: pressed ? OPACITY_IN_MS : OPACITY_OUT_MS,
        useNativeDriver: true,
      }),
    ]).start();
    // Refs são estáveis — não entram em deps (rule).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    animateTo(true);
  }, [animateTo, isDisabled]);
  const handlePressOut = useCallback(() => {
    if (isDisabled) return;
    animateTo(false);
  }, [animateTo, isDisabled]);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (isDisabled || pressLockedRef.current || !onPress) return;

      const result = onPress(event) as unknown;
      if (!result || typeof (result as Promise<unknown>).then !== "function") return;

      pressLockedRef.current = true;
      setIsPressPending(true);
      animateTo(false);

      Promise.resolve(result).finally(() => {
        pressLockedRef.current = false;
        if (isMountedRef.current) {
          setIsPressPending(false);
        }
      });
    },
    [animateTo, isDisabled, onPress],
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      scale.stopAnimation();
      opacity.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityState={{ disabled: isDisabled, busy: isPressPending }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={hitSlop}
    >
      <Animated.View style={[style, { transform: [{ scale }], opacity }]}>{children}</Animated.View>
    </Pressable>
  );
});
