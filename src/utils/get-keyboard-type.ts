import type { KeyboardTypeOptions } from "react-native";

export function getKeyboardType(placeholder?: string): KeyboardTypeOptions {
  if (placeholder?.startsWith("http")) return "url";
  return "default";
}
