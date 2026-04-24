import {
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from "@expo-google-fonts/montserrat";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";

const FONT_FAMILIES = [
  "Montserrat-Light",
  "Montserrat-Regular",
  "Montserrat-Medium",
  "Montserrat-SemiBold",
  "Montserrat-Bold",
  "Montserrat-ExtraBold",
  "Nexa-Heavy",
  "TTOctosquares-Black",
] as const;

async function loadFontFiles(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all(
    FONT_FAMILIES.map((family) => document.fonts.load(`1em "${family}"`).catch(() => undefined)),
  );
  await document.fonts.ready;
}

async function warmupFonts(): Promise<void> {
  if (typeof document === "undefined") return;
  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.style.cssText =
    "position:absolute;top:-9999px;left:-9999px;visibility:hidden;pointer-events:none";

  FONT_FAMILIES.forEach((family) => {
    const span = document.createElement("span");
    span.style.fontFamily = `"${family}"`;
    span.textContent = "AaBbCc 0123 ñÑáéíóú ¿¡";
    container.appendChild(span);
  });

  document.body.appendChild(container);

  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  container.remove();
}

export function useAppFonts(): boolean {
  const [fontsDeclared] = useFonts({
    "Montserrat-Light": Montserrat_300Light,
    "Montserrat-Regular": Montserrat_400Regular,
    "Montserrat-Medium": Montserrat_500Medium,
    "Montserrat-SemiBold": Montserrat_600SemiBold,
    "Montserrat-Bold": Montserrat_700Bold,
    "Montserrat-ExtraBold": Montserrat_800ExtraBold,
    "Nexa-Heavy": require("@/assets/fonts/Nexa-Heavy.ttf"),
    "TTOctosquares-Black": require("@/assets/fonts/TTOctosquares-Black.ttf"),
  });

  const [filesReady, setFilesReady] = useState(false);

  useEffect(() => {
    if (!fontsDeclared) return;
    let cancelled = false;

    async function prepare(): Promise<void> {
      await loadFontFiles();
      await warmupFonts();
      if (!cancelled) setFilesReady(true);
    }

    void prepare();

    return () => {
      cancelled = true;
    };
  }, [fontsDeclared]);

  return fontsDeclared && filesReady;
}
