import { Ionicons } from "@expo/vector-icons";
import React from "react";

const TAB_ICON_SIZE = 22;

export interface NavItemConfig {
  key: string;
  label: string;
  icon: (color: string, focused: boolean) => React.ReactNode;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    key: "recording",
    label: "Reuniones",
    icon: (color, focused) => (
      <Ionicons name={focused ? "mic" : "mic-outline"} size={TAB_ICON_SIZE} color={color} />
    ),
  },
  {
    key: "documents",
    label: "Subir documento",
    icon: (color, focused) => (
      <Ionicons
        name={focused ? "cloud-upload" : "cloud-upload-outline"}
        size={TAB_ICON_SIZE}
        color={color}
      />
    ),
  },
  {
    key: "my-plan",
    label: "Planes de negocio",
    icon: (color, focused) => (
      <Ionicons name={focused ? "trophy" : "trophy-outline"} size={TAB_ICON_SIZE} color={color} />
    ),
  },
  {
    key: "tasks",
    label: "Gestor de tareas",
    icon: (color, focused) => (
      <Ionicons
        name={focused ? "construct" : "construct-outline"}
        size={TAB_ICON_SIZE}
        color={color}
      />
    ),
  },
  {
    key: "strategy",
    label: "Nueva estrategia",
    icon: (color, focused) => (
      <Ionicons
        name={focused ? "bar-chart" : "bar-chart-outline"}
        size={TAB_ICON_SIZE}
        color={color}
      />
    ),
  },
];
