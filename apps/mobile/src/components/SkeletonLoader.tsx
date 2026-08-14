import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, useColorScheme } from "react-native";

export const SkeletonBox = ({ width, height, borderRadius = 8, style }: any) => {
  const isDark = useColorScheme() === "dark";
  const animValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animValue]);

  const baseColor = isDark ? "#1e293b" : "#e2e8f0";

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          opacity: animValue,
        },
        style,
      ]}
    />
  );
};

export function HomeScreenSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.dateBox}>
          <SkeletonBox width={120} height={20} />
        </View>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <SkeletonBox width={30} height={30} borderRadius={15} style={{ marginLeft: 16 }} />
      </View>

      {/* Daily Goals Row */}
      <View style={styles.goalsContainer}>
        <SkeletonBox width="31%" height={80} borderRadius={16} />
        <SkeletonBox width="31%" height={80} borderRadius={16} />
        <SkeletonBox width="31%" height={80} borderRadius={16} />
      </View>

      {/* Recommended Section */}
      <View style={styles.sectionHeader}>
        <SkeletonBox width={180} height={24} />
      </View>
      <View style={styles.horizontalScroll}>
        <SkeletonBox width={240} height={80} borderRadius={16} style={{ marginRight: 16 }} />
        <SkeletonBox width={240} height={80} borderRadius={16} />
      </View>

      {/* Premium Features */}
      <View style={styles.sectionHeader}>
        <SkeletonBox width={150} height={24} />
      </View>
      <View style={styles.horizontalScroll}>
        <SkeletonBox width={130} height={130} borderRadius={20} style={{ marginRight: 16 }} />
        <SkeletonBox width={130} height={130} borderRadius={20} style={{ marginRight: 16 }} />
        <SkeletonBox width={130} height={130} borderRadius={20} />
      </View>

      {/* List Section */}
      <View style={styles.sectionHeader}>
        <SkeletonBox width={140} height={24} />
      </View>
      <View style={styles.listContainer}>
        <SkeletonBox width="100%" height={60} borderRadius={12} style={{ marginBottom: 12 }} />
        <SkeletonBox width="100%" height={60} borderRadius={12} style={{ marginBottom: 12 }} />
        <SkeletonBox width="100%" height={60} borderRadius={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  dateBox: {
    flex: 1,
    alignItems: "center",
  },
  goalsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  horizontalScroll: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
});
