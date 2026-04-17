import { Stack } from "expo-router";

export default function BusinessMemoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_left",
        contentStyle: { backgroundColor: "transparent" },
      }}
    />
  );
}
