import type { StepIconConfig } from "@/constants/business-memory-steps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface StepIconProps {
  config: StepIconConfig;
  size: number;
  color: string;
}

export function StepIcon({ config, size, color }: StepIconProps) {
  if (config.library === "MaterialCommunityIcons") {
    return (
      <MaterialCommunityIcons
        name={config.name as React.ComponentProps<typeof MaterialCommunityIcons>["name"]}
        size={size}
        color={color}
      />
    );
  }
  return (
    <Ionicons
      name={config.name as React.ComponentProps<typeof Ionicons>["name"]}
      size={size}
      color={color}
    />
  );
}
