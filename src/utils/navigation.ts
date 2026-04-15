import { router, type Href } from "expo-router";

const HOME_HREF: Href = "/(app)/(tabs)/alter";

export function goBackOrHome(fallback: Href = HOME_HREF): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
