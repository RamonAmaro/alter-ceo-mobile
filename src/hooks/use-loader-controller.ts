import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

import { USE_NATIVE_DRIVER } from "@/constants/platform";

interface LoaderController {
  readonly isReady: boolean;
  readonly showLoader: boolean;
  readonly loaderOpacity: Animated.Value;
  readonly loaderPointerEvents: "auto" | "none";
}

interface LoaderControllerOptions {
  fontsLoaded: boolean;
  minDurationMs: number;
  fadeOutMs: number;
}

export function useLoaderController({
  fontsLoaded,
  minDurationMs,
  fadeOutMs,
}: LoaderControllerOptions): LoaderController {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const loaderOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), minDurationMs);
    return () => clearTimeout(timer);
  }, [minDurationMs]);

  const isReady = fontsLoaded && minTimeElapsed;

  useEffect(() => {
    if (!isReady) return;
    Animated.timing(loaderOpacity, {
      toValue: 0,
      duration: fadeOutMs,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => setShowLoader(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, fadeOutMs]);

  return {
    isReady,
    showLoader,
    loaderOpacity,
    loaderPointerEvents: isReady ? "none" : "auto",
  };
}
