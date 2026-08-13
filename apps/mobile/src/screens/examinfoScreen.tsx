// src/screens/examinfoScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { BlurView } from "expo-blur";
import { useExamInfo } from "../hooks/useContent";

interface ExamInfo {
  overview?: {
    notification?: string;
    prelims_date?: string;
    mains_date?: string;
  };
  key_dates?: Record<string, string>;
  eligibility?: {
    nationality?: string;
    age_limit?: {
      minimum_age?: string;
      maximum_age?: string;
    };
    relaxations?: Record<string, string>;
    education?: string;
    attempts?: Record<string, string>;
  };
  exam_pattern?: Record<
    string,
    {
      description?: string;
      paper_1?: { name?: string; purpose?: string };
      paper_2?: { name?: string; qualifying_marks?: string };
    }
  >;
}

export default function ExamInfoScreen() {
  const { data: sections, loading } = useExamInfo("UPSC_CSE");
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();

  /* THEME */
  const COLORS = {
    bg: (
      isDark
        ? ["#0b1220", "#111b2e"]
        : ["#e8f0ff", "#ffffff"]
    ) as [string, string],

    card: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    cardAlt: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
    border: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)",

    accent: isDark ? "#06b6d4" : "#0284c7",
    text: isDark ? "#e2e8f0" : "#1e293b",
    sub: isDark ? "#94a3b8" : "#475569",
  };

  useEffect(() => {
    if (!loading && sections.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, sections, fadeAnim]);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* LOADING STATE */
  if (loading) {
    return (
      <LinearGradient colors={COLORS.bg} style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={[styles.loading, { color: COLORS.sub }]}>
          Fetching UPSC Exam Information...
        </Text>
      </LinearGradient>
    );
  }

  /* NO DATA STATE */
  if (!loading && sections.length === 0) {
    return (
      <LinearGradient colors={COLORS.bg} style={styles.center}>
        <Ionicons name="information-circle-outline" size={40} color="#fbbf24" />
        <Text style={[styles.errorText, { color: COLORS.sub }]}>
          ⚠️ No UPSC exam data found.
        </Text>
      </LinearGradient>
    );
  }

  /* MAIN SCREEN */
  return (
    <LinearGradient colors={COLORS.bg} style={styles.gradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={COLORS.bg[0]}
        />

        {/* Header */}
        <BlurView
          intensity={40}
          tint={isDark ? "dark" : "light"}
          style={styles.headerBlur}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.accent} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: COLORS.accent }]}>
              UPSC CSE 2026 Info
            </Text>

            <View style={{ width: 40 }} />
          </View>
        </BlurView>

        {/* Content */}
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {sections.map((section) => (
              <View
                key={section.id}
                style={[
                  styles.sectionCard,
                  { backgroundColor: COLORS.card, borderColor: COLORS.border },
                ]}
              >
                <TouchableOpacity
                  onPress={() => toggleExpand(section.id)}
                  style={styles.expandHeader}
                >
                  <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>
                    {section.title}
                  </Text>
                  <Ionicons
                    name={expanded[section.id] ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={COLORS.accent}
                  />
                </TouchableOpacity>
                {expanded[section.id] && (
                  <View style={[styles.expandBody, { borderTopColor: COLORS.border }]}>
                    <Text style={[styles.paragraph, { color: COLORS.text }]}>
                      {section.content}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            <View style={styles.footerBox}>
              <Text style={[styles.footerText, { color: COLORS.sub }]}>
                Based on official UPSC notification. Always verify at upsc.gov.in.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loading: { marginTop: 10, fontSize: 14 },

  errorText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 10,
  },

  /* HEADER */
  headerBlur: {
    paddingTop: 50,
    paddingBottom: 14,
    borderBottomWidth: 0.6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },

  /* SECTION CARD */
  sectionCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },

  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },

  subHeading: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 12,
  },

  /* TIMELINE */
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
    marginTop: 6,
  },
  timelineTextBox: {
    flex: 1,
  },
  timelineEvent: {
    fontSize: 13,
    fontWeight: "600",
  },
  timelineDate: {
    fontSize: 12,
    marginTop: 2,
  },

  /* ACCORDION */
  expandHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.6,
  },

  /* SUB-CARD FOR PATTERN */
  patternCard: {
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },

  /* FOOTER */
  footerBox: {
    marginTop: 22,
    marginBottom: 40,
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
  },
});
