import SafeContainer from '../components/SafeContainer';
import { ListSkeleton } from "../components/SkeletonLoader";
// src/screens/CutOffScreen.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useCutoffs } from "../hooks/useContent";

export default function CutOffScreen({ navigation }: any) {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const { data: cutoffData, loading } = useCutoffs("UPSC_CSE", selectedYear);

  const isDark = useColorScheme() === "dark";

  const COLORS = {
    bg: isDark
      ? (["#0b1220", "#111b2e"] as [string, string])
      : (["#e9f2ff", "#ffffff"] as [string, string]),

    card: isDark
      ? "rgba(255,255,255,0.05)"
      : "rgba(0,0,0,0.05)",

    border: isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.1)",

    accent: isDark ? "#06b6d4" : "#0284c7",

    text: isDark ? "#e2e8f0" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    faint: isDark ? "#1e293b" : "#f1f5f9",
  };

  const YEARS = Array.from({ length: 11 }, (_, i) => 2015 + i);

  return (
    <LinearGradient colors={COLORS.bg} style={{ flex: 1 }}>
      <SafeContainer style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* HEADER */}
          <BlurView
            intensity={40}
            tint={isDark ? "dark" : "light"}
            style={styles.header}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backBtn, { backgroundColor: COLORS.card }]}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.accent} />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: COLORS.text }]}>
                UPSC Cut-Offs
              </Text>
              <Text style={[styles.headerSub, { color: COLORS.sub }]}>
                2015 – 2025 Trends
              </Text>
            </View>

            <Ionicons name="stats-chart" size={28} color={COLORS.accent} />
          </BlurView>

          {/* YEAR SELECTOR */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.yearScroll}
          >
            {YEARS.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearButton,
                  {
                    backgroundColor:
                      selectedYear === year ? COLORS.accent : COLORS.card,
                  },
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text
                  style={[
                    styles.yearText,
                    { color: selectedYear === year ? "#fff" : COLORS.sub },
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* CONTENT */}
          {loading ? (
            <ListSkeleton />
          ) : cutoffData.length === 0 ? (
            <Text style={[styles.noData, { color: COLORS.accent }]}>
              No cut-off data found for {selectedYear}
            </Text>
          ) : (
            <View style={{ marginTop: 20 }}>
              {/* TABLE HEAD */}
              <View
                style={[
                  styles.tableHead,
                  { backgroundColor: COLORS.faint },
                ]}
              >
                <Text style={[styles.colHead, { color: COLORS.accent }]}>
                  Category
                </Text>
                <Text style={[styles.colHead, { color: COLORS.accent }]}>
                  Prelim
                </Text>
                <Text style={[styles.colHead, { color: COLORS.accent }]}>
                  Main
                </Text>
                <Text style={[styles.colHead, { color: COLORS.accent }]}>
                  Final
                </Text>
              </View>

              {/* TABLE ROWS */}
              {cutoffData.map((row, index) => (
                  <View
                    key={index}
                    style={[
                      styles.rowCard,
                      {
                        backgroundColor: COLORS.card,
                        borderColor: COLORS.border,
                      },
                    ]}
                  >
                    <Text style={[styles.rowText, { color: COLORS.text }]}>
                      {row.category}
                    </Text>

                    <Text style={[styles.rowText, { color: COLORS.sub }]}>
                      {row.prelimsCutoff ?? "-"}
                    </Text>

                    <Text style={[styles.rowText, { color: COLORS.sub }]}>
                      {row.mainsCutoff ?? "-"}
                    </Text>

                    <Text
                      style={[
                        styles.rowText,
                        row.finalCutoff == null
                          ? { color: "#fbbf24", fontWeight: "700" }
                          : { color: COLORS.sub },
                      ]}
                    >
                      {row.finalCutoff ?? "Not published"}
                    </Text>
                  </View>
              ))}
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.6,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
  },

  yearScroll: {
    marginTop: 12,
    paddingLeft: 16,
    paddingBottom: 10,
  },
  yearButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 24,
    marginRight: 10,
  },
  yearText: {
    fontSize: 14,
    fontWeight: "700",
  },

  loadingBox: {
    marginTop: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 6,
  },

  noData: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },

  tableHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  colHead: {
    width: "25%",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 13,
  },

  rowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowText: {
    width: "25%",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },
});
