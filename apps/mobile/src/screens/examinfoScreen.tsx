import React, { useState, useRef, useEffect } from "react";
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

const UPSC_EXAM_INFO = {
  OVERVIEW: [
    {
      id: "o1",
      title: "What is UPSC CSE?",
      subtitle: "Civil Services Examination",
      content:
        "The Civil Services Examination (CSE) is a nationwide competitive examination in India conducted by the Union Public Service Commission (UPSC) for recruitment to various Civil Services of the Government of India, including the Indian Administrative Service (IAS), Indian Foreign Service (IFS), and Indian Police Service (IPS).",
    },
    {
      id: "o2",
      title: "Exam Stages",
      subtitle: "Three-tier process",
      content:
        "1. Preliminary Examination (Objective type) for the selection of candidates for the Main Examination.\n2. Main Examination (Written/Descriptive) for the selection of candidates for the various Services.\n3. Interview (Personality Test) for the final selection of candidates.",
    },
    {
      id: "o3",
      title: "Key Dates (Tentative)",
      subtitle: "Annual Cycle",
      content:
        "• Notification: February\n• Preliminary Exam: Late May or early June\n• Mains Exam: September\n• Personality Test: January to April of the following year",
    },
  ],
  ELIGIBILITY: [
    {
      id: "e1",
      title: "Nationality",
      subtitle: "Citizenship Requirements",
      content:
        "• For the Indian Administrative Service (IAS), the Indian Foreign Service (IFS) and the Indian Police Service (IPS), a candidate must be a citizen of India.\n• For other services, a candidate must be either a citizen of India, or a subject of Nepal/Bhutan, or a Tibetan refugee who came over to India before 1st January, 1962.",
    },
    {
      id: "e2",
      title: "Educational Qualifications",
      subtitle: "Degree Required",
      content:
        "The candidate must hold a degree of any of the Universities incorporated by an Act of the Central or State Legislature in India or other educational institutions established by an Act of Parliament or declared to be deemed as a University Under Section-3 of the University Grants Commission Act, 1956, or possess an equivalent qualification.",
    },
    {
      id: "e3",
      title: "Age Limits",
      subtitle: "21 to 32 Years (General)",
      content:
        "A candidate must have attained the age of 21 years and must not have attained the age of 32 years on the 1st of August of the examination year.\n\nRelaxations:\n• Up to 3 years for OBC candidates.\n• Up to 5 years for SC/ST candidates.\n• Up to 10 years for PwBD candidates.",
    },
    {
      id: "e4",
      title: "Number of Attempts",
      subtitle: "Maximum tries per category",
      content:
        "• General Category: 6 attempts\n• OBC Category: 9 attempts\n• SC/ST Category: Unlimited attempts (up to the age limit)\n• PwBD Category: 9 attempts for General/OBC/EWS, Unlimited for SC/ST",
    },
  ],
  PATTERN: [
    {
      id: "p1",
      title: "Phase I: Preliminary Exam",
      subtitle: "Objective Type (400 Marks)",
      content:
        "Consists of two compulsory papers of 200 marks each.\n• GS Paper I: 100 questions, 2 hours. Counts for merit.\n• GS Paper II (CSAT): 80 questions, 2 hours. Qualifying only (minimum 33% required).\nThere is a negative marking of 1/3rd for every incorrect answer.",
    },
    {
      id: "p2",
      title: "Phase II: Main Exam",
      subtitle: "Descriptive Type (1750 Marks)",
      content:
        "Consists of 9 papers, out of which 2 are qualifying (Indian Language and English, 300 marks each). The remaining 7 papers count for merit (250 marks each):\n• Essay\n• GS I (Heritage & Culture, History & Geography of the World)\n• GS II (Governance, Constitution, Polity, Social Justice & IR)\n• GS III (Technology, Economic Dev., Bio-diversity, Environment, Security & Disaster Mgmt)\n• GS IV (Ethics, Integrity, and Aptitude)\n• Optional Subject Paper 1\n• Optional Subject Paper 2",
    },
    {
      id: "p3",
      title: "Phase III: Personality Test",
      subtitle: "Interview (275 Marks)",
      content:
        "The candidate will be interviewed by a Board who will assess their personal suitability for a career in public service. The total marks for the written examination is 1750 and the interview is 275. The grand total is 2025 Marks.",
    },
  ],
};

type TabType = "OVERVIEW" | "ELIGIBILITY" | "PATTERN";

export default function ExamInfoScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("OVERVIEW");
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";

  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f0ff", "#ffffff"] as [string, string]),
    card: isDark ? "#1e293b" : "#ffffff",
    border: isDark ? "#334155" : "#e2e8f0",
    accent: isDark ? "#06b6d4" : "#0284c7",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    tabBg: isDark ? "#0f172a" : "#f1f5f9",
    activeTabBtn: isDark ? "#06b6d4" : "#0ea5e9",
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTabBtn = (tab: TabType, label: string) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.tabBtn,
          isActive && { backgroundColor: COLORS.activeTabBtn },
        ]}
        onPress={() => {
          if (activeTab !== tab) {
            fadeAnim.setValue(0);
            setActiveTab(tab);
            scrollRef.current?.scrollTo({ y: 0, animated: false });
          }
        }}
      >
        <Text style={[styles.tabText, isActive && { color: "#fff", fontWeight: "700" }, !isActive && { color: COLORS.sub }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const currentData = UPSC_EXAM_INFO[activeTab];

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: isDark ? "rgba(11,18,32,0.95)" : "rgba(255,255,255,0.95)", borderBottomColor: COLORS.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.title, { color: COLORS.text }]}>Exam Info</Text>
            <Text style={[styles.subtitle, { color: COLORS.sub }]}>UPSC CSE Guide</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* TABS */}
        <View style={[styles.tabContainer, { backgroundColor: COLORS.tabBg }]}>
          {renderTabBtn("OVERVIEW", "Overview")}
          {renderTabBtn("ELIGIBILITY", "Eligibility")}
          {renderTabBtn("PATTERN", "Pattern")}
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {currentData.map((item) => {
            const isExp = expanded[item.id] || (activeTab === "PATTERN"); // auto expand pattern

            return (
              <View key={item.id} style={[styles.card, { backgroundColor: COLORS.card, borderColor: COLORS.border, shadowColor: isDark ? "#000" : "#cbd5e1" }]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.cardHeader}
                  onPress={() => toggleExpand(item.id)}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.cardTitle, { color: COLORS.text }]}>{item.title}</Text>
                    {!!item.subtitle && <Text style={[styles.cardSubtitle, { color: COLORS.accent }]}>{item.subtitle}</Text>}
                  </View>
                  <Animated.View style={{ transform: [{ rotate: isExp ? "180deg" : "0deg" }] }}>
                    <Ionicons name="chevron-down" size={22} color={COLORS.sub} />
                  </Animated.View>
                </TouchableOpacity>

                {isExp && (
                  <View style={[styles.cardBody, { borderTopColor: COLORS.border }]}>
                    <Text style={[styles.cardContent, { color: COLORS.sub }]}>{item.content}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  backBtn: {
    padding: 10,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  cardBody: {
    padding: 16,
    borderTopWidth: 1,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: "justify",
  },
});
