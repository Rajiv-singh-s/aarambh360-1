import SafeContainer from '../components/SafeContainer';
// src/screens/pyqScreen.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Animated,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { usePyq } from "../hooks/useContent";

export default function PYQScreen({ navigation }: any) {
  const { data: questions, loading } = usePyq(2025);
  const year = 2025;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const isDark = useColorScheme() === "dark";

  /* Themed Colors */
  const COLORS = {
    bg: isDark
      ? (["#0b1220", "#111b2e"] as [string, string])
      : (["#eaf1ff", "#ffffff"] as [string, string]),

    card: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    accent: isDark ? "#06b6d4" : "#0284c7",
    text: isDark ? "#e2e8f0" : "#1e293b",
    sub: isDark ? "#94a3b8" : "#475569",
  };

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, fadeAnim]);

  if (loading) {
    return (
      <LinearGradient colors={COLORS.bg} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={[styles.loadingText, { color: COLORS.sub }]}>
          Fetching PYQs…
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.bg} style={{ flex: 1 }}>
      <SafeContainer style={{ flex: 1 }}>
        <StatusBar translucent backgroundColor="transparent" />

        {/* HEADER */}
        <View style={[styles.headerBlur, { backgroundColor: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.accent} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>PYQs - GS1 ({year})</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* BODY */}
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* INTRO CARD */}
            <View
              style={[
                styles.introCard,
                { backgroundColor: COLORS.card, borderColor: COLORS.border },
              ]}
            >
              <Text style={[styles.introTitle, { color: COLORS.text }]}>
                📘 General Studies Paper 1
              </Text>

              <Text style={[styles.introSub, { color: COLORS.sub }]}>
                UPSC CSE Mains Previous Year Questions
              </Text>

              <View style={styles.introRow}>
                <FontAwesome5 name="pen-fancy" size={18} color={COLORS.accent} />
                <Text style={[styles.introDetail, { color: COLORS.text }]}>
                  20 Questions
                </Text>
              </View>

              <View style={styles.introRow}>
                <Ionicons name="book-outline" size={18} color={COLORS.accent} />
                <Text style={[styles.introDetail, { color: COLORS.text }]}>
                  Word Limit: 150 / 250
                </Text>
              </View>
            </View>

            {/* QUESTION LIST */}
            {questions.map((q, index) => (
              <TouchableOpacity
                key={q.id}
                style={[
                  styles.questionCard,
                  {
                    backgroundColor: COLORS.card,
                    borderColor: COLORS.accent,
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={[
                      styles.indexCircle,
                      { backgroundColor: COLORS.border },
                    ]}
                  >
                    <Text style={[styles.indexText, { color: COLORS.accent }]}>
                      {q.questionNumber ?? index + 1}
                    </Text>
                  </View>

                  <Text style={[styles.qText, { color: COLORS.text }]}>
                    {q.text}
                  </Text>
                </View>

                <Text style={[styles.qMeta, { color: COLORS.sub }]}>
                  Year {q.examYear} | Paper {q.paper}
                  {q.marks ? ` | ${q.marks} marks` : ""}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={{ height: 140 }} />
          </ScrollView>
        </Animated.View>
      </SafeContainer>
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

  headerBlur: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  introCard: {
    margin: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  introSub: {
    marginTop: 6,
    fontSize: 14,
  },
  introRow: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
  },
  introDetail: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
  },

  questionCard: {
    marginTop: 14,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  indexCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  indexText: {
    fontSize: 14,
    fontWeight: "700",
  },
  qText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  qMeta: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "600",
  },
});
