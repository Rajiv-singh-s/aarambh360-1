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

const UPSC_SYLLABUS = {
  PRELIMS: [
    {
      id: "p1",
      title: "General Studies Paper I",
      subtitle: "200 Marks • 2 Hours",
      content:
        "• Current events of national and international importance.\n• History of India and Indian National Movement.\n• Indian and World Geography - Physical, Social, Economic Geography of India and the World.\n• Indian Polity and Governance - Constitution, Political System, Panchayati Raj, Public Policy, Rights Issues, etc.\n• Economic and Social Development - Sustainable Development, Poverty, Inclusion, Demographics, Social Sector Initiatives, etc.\n• General issues on Environmental ecology, Bio-diversity and Climate Change (no subject specialization required).\n• General Science.",
    },
    {
      id: "p2",
      title: "CSAT (General Studies Paper II)",
      subtitle: "200 Marks • 2 Hours • Qualifying (33%)",
      content:
        "• Comprehension.\n• Interpersonal skills including communication skills.\n• Logical reasoning and analytical ability.\n• Decision making and problem solving.\n• General mental ability.\n• Basic numeracy (numbers and their relations, orders of magnitude, etc.) (Class X level).\n• Data interpretation (charts, graphs, tables, data sufficiency etc. - Class X level).",
    },
  ],
  MAINS: [
    {
      id: "m0",
      title: "Qualifying Papers",
      subtitle: "300 Marks Each • Qualifying Only",
      content:
        "• Paper A: One of the Indian Languages to be selected by the candidate from the Languages included in the Eighth Schedule to the Constitution.\n• Paper B: English.",
    },
    {
      id: "m1",
      title: "Paper I: Essay",
      subtitle: "250 Marks",
      content:
        "Candidates will be required to write an essay on a specific topic. The choice of subjects will be given. They will be expected to keep closely to the subject of the essay to arrange their ideas in orderly fashion, and to write concisely. Credit will be given for effective and exact expression.",
    },
    {
      id: "m2",
      title: "Paper II: General Studies I",
      subtitle: "250 Marks",
      content:
        "Indian Heritage and Culture, History and Geography of the World and Society.",
    },
    {
      id: "m3",
      title: "Paper III: General Studies II",
      subtitle: "250 Marks",
      content:
        "Governance, Constitution, Polity, Social Justice and International relations.",
    },
    {
      id: "m4",
      title: "Paper IV: General Studies III",
      subtitle: "250 Marks",
      content:
        "Technology, Economic Development, Bio-diversity, Environment, Security and Disaster Management.",
    },
    {
      id: "m5",
      title: "Paper V: General Studies IV",
      subtitle: "250 Marks",
      content:
        "Ethics, Integrity and Aptitude.\nThis paper will include questions to test the candidates' attitude and approach to issues relating to integrity, probity in public life and his problem solving approach to various issues and conflicts faced by him in dealing with society.",
    },
    {
      id: "m6",
      title: "Papers VI & VII: Optional Subject",
      subtitle: "250 Marks Each",
      content:
        "Two papers on the optional subject chosen by the candidate from the list of approved subjects.",
    },
  ],
  INTERVIEW: [
    {
      id: "i1",
      title: "Personality Test",
      subtitle: "275 Marks",
      content:
        "The candidate will be interviewed by a Board who will have before them a record of his/her career. He/she will be asked questions on matters of general interest.\n\nThe object of the interview is to assess the personal suitability of the candidate for a career in public service by a Board of competent and unbiased observers. The test is intended to judge the mental calibre of a candidate.\n\nTraits evaluated:\n• Intellectual qualities & social traits.\n• Mental alertness.\n• Critical powers of assimilation.\n• Clear and logical exposition.\n• Balance of judgement.\n• Variety and depth of interest.\n• Ability for social cohesion and leadership.\n• Intellectual and moral integrity.",
    },
  ],
};

type TabType = "PRELIMS" | "MAINS" | "INTERVIEW";

export default function SyllabusScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("PRELIMS");
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

  const currentData = UPSC_SYLLABUS[activeTab];

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: isDark ? "rgba(11,18,32,0.95)" : "rgba(255,255,255,0.95)", borderBottomColor: COLORS.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.title, { color: COLORS.text }]}>UPSC CSE Syllabus</Text>
            <Text style={[styles.subtitle, { color: COLORS.sub }]}>Comprehensive Exam Breakdown</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* TABS */}
        <View style={[styles.tabContainer, { backgroundColor: COLORS.tabBg }]}>
          {renderTabBtn("PRELIMS", "Prelims")}
          {renderTabBtn("MAINS", "Mains")}
          {renderTabBtn("INTERVIEW", "Interview")}
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {currentData.map((item) => {
            const isExp = expanded[item.id] || (activeTab === "INTERVIEW"); // auto expand interview

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
