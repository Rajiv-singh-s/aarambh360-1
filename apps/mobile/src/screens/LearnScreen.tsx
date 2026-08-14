import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useColorScheme,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";

export default function LearnScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f0ff", "#ffffff"] as [string, string]),
    card: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    accent: isDark ? "#06b6d4" : "#0284c7",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    tagBg: isDark ? "rgba(6,182,212,0.15)" : "#e0f2fe",
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const SECTIONS = [
    {
      id: "syllabus",
      title: "Complete Syllabus Notes",
      subtitle: "Topic-wise detailed study material covering Prelims & Mains.",
      icon: "book-outline" as const,
      status: "Coming Soon",
    },
    {
      id: "short_notes",
      title: "Short Revision Notes",
      subtitle: "Crisp, concise notes for quick revision before exams.",
      icon: "flash-outline" as const,
      status: "In Progress",
    },
    {
      id: "mind_maps",
      title: "Interactive Mind Maps",
      subtitle: "Visual connection of concepts for better retention.",
      icon: "git-network-outline" as const,
      status: "Planned",
    },
    {
      id: "mcq_banks",
      title: "Topic-wise MCQ Banks",
      subtitle: "Practice questions aligned strictly with the syllabus.",
      icon: "checkmark-circle-outline" as const,
      status: "Planned",
    },
  ];

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: isDark ? "rgba(11,18,32,0.95)" : "rgba(255,255,255,0.95)", borderBottomColor: COLORS.border }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.title, { color: COLORS.text }]}>Learn</Text>
              <Text style={[styles.subtitle, { color: COLORS.sub }]}>Your structured study materials</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>
        </View>

        {/* CONTENT */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.banner}>
              <Ionicons name="construct-outline" size={32} color={COLORS.accent} />
              <Text style={[styles.bannerTitle, { color: COLORS.text }]}>We are building this!</Text>
              <Text style={[styles.bannerSub, { color: COLORS.sub }]}>
                The complete syllabus notes and materials are currently being prepared by our expert educators.
              </Text>
            </View>

            {SECTIONS.map((sec) => (
              <TouchableOpacity
                key={sec.id}
                activeOpacity={0.8}
                style={[styles.card, { backgroundColor: COLORS.card, borderColor: COLORS.border, shadowColor: isDark ? "#000" : "#cbd5e1" }]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: COLORS.tagBg }]}>
                    <Ionicons name={sec.icon} size={22} color={COLORS.accent} />
                  </View>
                  <View style={[styles.tag, { backgroundColor: COLORS.tagBg }]}>
                    <Text style={[styles.tagText, { color: COLORS.accent }]}>{sec.status}</Text>
                  </View>
                </View>
                <Text style={[styles.cardTitle, { color: COLORS.text }]}>{sec.title}</Text>
                <Text style={[styles.cardSub, { color: COLORS.sub }]}>{sec.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </ScrollView>

        {/* AI MENTOR FAB */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.fab, { backgroundColor: COLORS.accent, shadowColor: COLORS.accent }]}
          onPress={() => navigation.navigate("AiMentorScreen")}
        >
          <Ionicons name="sparkles" size={24} color="#fff" />
          <Text style={styles.fabText}>Ask AI</Text>
        </TouchableOpacity>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingTop: Platform.OS === "ios" ? 10 : 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  backBtn: { padding: 10 },
  headerTitleContainer: { flex: 1, alignItems: "center" },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 2 },
  
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 80,
  },
  
  banner: {
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },
  bannerSub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  card: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 14,
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    marginLeft: 8,
  },
});
