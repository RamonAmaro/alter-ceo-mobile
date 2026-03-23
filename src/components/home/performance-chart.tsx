import { Image, StyleSheet } from "react-native";

export function PerformanceChart() {
  return (
    <Image
      source={require("@/assets/images/machines-chart.png")}
      resizeMode="cover"
      style={styles.image}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: "100%",
  },
});
