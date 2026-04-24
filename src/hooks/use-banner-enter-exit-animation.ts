import { useCallback, useEffect, useRef } from "react";
import { Animated } from "react-native";

// Animação padrão de entrada/saída para banners: fade + slide sutil.
// Entrada dispara automaticamente no mount; saída é disparada pelo consumidor
// via `animateExit(callback)` e a callback roda ao final da animação.
//
// Tudo em `transform` + `opacity` com `useNativeDriver: true` para respeitar a
// regra do projeto (rules/animations.md).

const ENTER_DURATION_MS = 260;
const EXIT_DURATION_MS = 200;
const INITIAL_TRANSLATE_Y = 8;

interface EnterExitAnimation {
  readonly style: {
    readonly opacity: Animated.Value;
    readonly transform: readonly [{ readonly translateY: Animated.Value }];
  };
  readonly animateExit: (onComplete: () => void) => void;
}

export function useBannerEnterExitAnimation(): EnterExitAnimation {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(INITIAL_TRANSLATE_Y)).current;
  const exitingRef = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ENTER_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: ENTER_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start();
    // Refs são estáveis — não entram em deps (rule).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animateExit = useCallback((onComplete: () => void) => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: EXIT_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: INITIAL_TRANSLATE_Y,
        duration: EXIT_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    style: {
      opacity,
      transform: [{ translateY }],
    },
    animateExit,
  };
}
