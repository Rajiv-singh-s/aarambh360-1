// src/screens/SyllabusScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { SyllabusTreeNodeDto } from "@aarambh360/types";
import { useSyllabusTree } from "../hooks/useContent";

export default function SyllabusScreen() {
  const { data: syllabusData, loading } = useSyllabusTree("UPSC_CSE");
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";

  const COLORS = {
    bg: (
      isDark
        ? ["#0b1220", "#111b2e"]
        : ["#e9f0ff", "#ffffff"]
    ) as [string, string],

    card: isDark
      ? "rgba(255,255,255,0.05)"
      : "rgba(0,0,0,0.05)",

    border: isDark
      ? "rgba(255,255,255,0.1)"
      : "rgba(0,0,0,0.15)",

    accent: isDark ? "#06b6d4" : "#0284c7",

    text: isDark ? "#e2e8f0" : "#1e293b",
    sub: isDark ? "#94a3b8" : "#475569",
  };

  /* FADE-IN ANIMATION */
  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, syllabusData, fadeAnim]);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const scrollTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const renderTreeNodes = (nodes: SyllabusTreeNodeDto[], parentKey = ""): React.ReactNode =>
    nodes.map((node) => {
      const uniqueKey = `${parentKey}_${node.id}`;
      return (
        <View
          key={uniqueKey}
          style={[
            styles.card,
            { backgroundColor: COLORS.card, borderColor: COLORS.border },
          ]}
        >
          <TouchableOpacity
            style={styles.cardHeader}
            activeOpacity={0.8}
            onPress={() => toggleExpand(uniqueKey)}
          >
            <Text style={[styles.section, { color: COLORS.accent }]}>{node.title}</Text>
            <Animated.View
              style={{
                transform: [{ rotate: expanded[uniqueKey] ? "180deg" : "0deg" }],
              }}
            >
              <Ionicons name="chevron-down" size={20} color={COLORS.accent} />
            </Animated.View>
          </TouchableOpacity>

          {expanded[uniqueKey] && (
            <View style={[styles.cardBody, { borderColor: COLORS.border }]}>
              {node.description ? (
                <Text style={[styles.details, { color: COLORS.text }]}>{node.description}</Text>
              ) : null}
              {node.children?.length ? renderTreeNodes(node.children, uniqueKey) : null}
            </View>
          )}
        </View>
      );
    });

  /* LOADING SCREEN */
  if (loading) {
    return (
      <LinearGradient colors={COLORS.bg} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={[styles.loadingText, { color: COLORS.sub }]}>
          Fetching UPSC Syllabus...
        </Text>
      </LinearGradient>
    );
  }

  /* MAIN UI */
  return (
    <LinearGradient colors={COLORS.bg} style={{ flex: 1 }}>
      {/* HEADER */}
      <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.accent} />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={[styles.title, { color: COLORS.text }]}>
              UPSC Syllabus
            </Text>
            <Text style={[styles.subtitle, { color: COLORS.sub }]}>
              Prelims • Mains • Interview
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </View>
      </BlurView>

      {/* CONTENT */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {syllabusData.length > 0 ? (
            renderTreeNodes(syllabusData)
          ) : (
            <Text style={[styles.details, { color: COLORS.sub }]}>
              No syllabus data available.
            </Text>
          )}

          <View style={{ height: 120 }} />
        </Animated.View>
      </ScrollView>

      {/* SCROLL TO TOP BUTTON */}
      <TouchableOpacity style={styles.scrollTopBtn} onPress={scrollTop}>
        <LinearGradient
          colors={[COLORS.accent, COLORS.accent]}
          style={styles.scrollTopInner}
        >
          <Ionicons name="arrow-up" size={22} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },

  header: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 0.4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
  },

  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  card: {
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  section: {
    fontSize: 15,
    fontWeight: "700",
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
    borderTopWidth: 0.6,
  },
  details: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
    textAlign: "justify",
  },

  scrollTopBtn: {
    position: "absolute",
    bottom: 24,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 6,
  },
  scrollTopInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
});
