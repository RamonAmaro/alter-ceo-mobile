import { AlterLogo } from "@/components/alter-logo";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

const TAB_ICON_SIZE = 24;
const CENTER_LOGO_SIZE = 30;

export interface NavItemConfig {
  key: string;
  label: string;
  icon: (color: string, focused: boolean) => React.ReactNode;
  isCenter?: boolean;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    key: "recording",
    label: "Grabar",
    icon: (color, focused) => (
      <Ionicons name={focused ? "mic" : "mic-outline"} size={TAB_ICON_SIZE} color={color} />
    ),
  },
  {
    key: "business-memory",
    label: "Mi Negocio",
    icon: (color, focused) => (
      <Ionicons
        name={focused ? "briefcase" : "briefcase-outline"}
        size={TAB_ICON_SIZE}
        color={color}
      />
    ),
  },
  {
    key: "alter",
    label: "Inicio",
    isCenter: true,
    icon: (_color, _focused) => <AlterLogo size={CENTER_LOGO_SIZE} />,
  },
  {
    key: "my-plan",
    label: "Mi Plan",
    icon: (color, focused) => (
      <Ionicons name={focused ? "trophy" : "trophy-outline"} size={TAB_ICON_SIZE} color={color} />
    ),
  },
  {
    key: "strategy",
    label: "Estrategia",
    icon: (color, focused) => (
      <Ionicons
        name={focused ? "bar-chart" : "bar-chart-outline"}
        size={TAB_ICON_SIZE}
        color={color}
      />
    ),
  },
];
