import { Platform } from "react-native";

export const USE_NATIVE_DRIVER = Platform.OS !== "web";

export const SHOW_SCROLL_INDICATOR = Platform.OS === "web";
