import { AlterLogo } from "@/components/alter-logo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

const TAB_ICON_SIZE = 22;

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#00FF84",
        tabBarInactiveTintColor: "rgba(255,255,255,0.35)",
        tabBarShowLabel: false,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="mic-outline" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="settings-outline"
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alter"
        options={{
          tabBarIcon: () => (
            <View style={styles.centerOuter}>
              <View style={styles.centerGlowOuter} />
              <View style={styles.centerGlow} />
              <View style={styles.centerTab}>
                <AlterLogo size={24} color="#000000" />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="bell-outline"
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="bar-chart-outline"
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(10,15,20,0.95)",
    borderTopWidth: 0,
    height: Platform.OS === "ios" ? 88 : 70,
    paddingTop: 8,
    elevation: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabItem: {
    paddingTop: 4,
  },
  centerOuter: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
  },
  centerGlowOuter: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,255,132,0.06)",
  },
  centerGlow: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(0,255,132,0.12)",
  },
  centerTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#00FF84",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(0,255,132,0.3)",
    ...Platform.select({
      ios: {
        shadowColor: "#00FF84",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
});
