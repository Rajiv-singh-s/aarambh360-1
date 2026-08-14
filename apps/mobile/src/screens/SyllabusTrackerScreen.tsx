import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Simplified Syllabus Structure for Demo
const SYLLABUS_DATA = [
  {
    id: "gs1",
    title: "General Studies I",
    chapters: [
      { id: "gs1_1", title: "Indian Heritage and Culture" },
      { id: "gs1_2", title: "History of the World" },
      { id: "gs1_3", title: "Geography of the World" },
      { id: "gs1_4", title: "Society and Women's Issues" },
    ],
  },
  {
    id: "gs2",
    title: "General Studies II",
    chapters: [
      { id: "gs2_1", title: "Indian Constitution" },
      { id: "gs2_2", title: "Functions of Parliament" },
      { id: "gs2_3", title: "International Relations" },
      { id: "gs2_4", title: "Social Justice" },
    ],
  },
  {
    id: "gs3",
    title: "General Studies III",
    chapters: [
      { id: "gs3_1", title: "Indian Economy" },
      { id: "gs3_2", title: "Science and Technology" },
      { id: "gs3_3", title: "Environment and Biodiversity" },
      { id: "gs3_4", title: "Disaster Management" },
    ],
  },
  {
    id: "gs4",
    title: "General Studies IV",
    chapters: [
      { id: "gs4_1", title: "Ethics and Human Interface" },
      { id: "gs4_2", title: "Attitude and Emotional Intelligence" },
      { id: "gs4_3", title: "Probity in Governance" },
    ],
  },
];

const TOTAL_CHAPTERS = SYLLABUS_DATA.reduce((acc, curr) => acc + curr.chapters.length, 0);

export default function SyllabusTrackerScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ gs1: true });
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f0ff", "#ffffff"] as [string, string]),
    cardBg: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    accent: "#06b6d4",
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem("syllabusProgress");
      if (saved) {
        setCompletedItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveProgress = async (newProgress: Record<string, boolean>) => {
    try {
      await AsyncStorage.setItem("syllabusProgress", JSON.stringify(newProgress));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleItem = (id: string) => {
    const newProgress = { ...completedItems, [id]: !completedItems[id] };
    setCompletedItems(newProgress);
    saveProgress(newProgress);
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / TOTAL_CHAPTERS) * 100);

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Syllabus Tracker</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Master Progress Bar */}
        <View style={styles.masterProgressBox}>
          <View style={styles.progressHeaderRow}>
            <Text style={[styles.progressTitle, { color: COLORS.text }]}>Overall Completion</Text>
            <Text style={[styles.progressPercent, { color: COLORS.accent }]}>{progressPercentage}%</Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: COLORS.border }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%`, backgroundColor: COLORS.accent }]} />
          </View>
          <Text style={[styles.progressSub, { color: COLORS.sub }]}>
            {completedCount} of {TOTAL_CHAPTERS} chapters mastered
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {SYLLABUS_DATA.map((section) => {
            const isExpanded = expandedSections[section.id];
            const sectionCompletedCount = section.chapters.filter((c) => completedItems[c.id]).length;
            const sectionTotal = section.chapters.length;
            const isSectionDone = sectionCompletedCount === sectionTotal;

            return (
              <View key={section.id} style={[styles.sectionContainer, { backgroundColor: COLORS.cardBg, borderColor: COLORS.border }]}>
                {/* Section Header */}
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(section.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionTitleText, { color: isSectionDone ? "#10b981" : COLORS.text }]}>
                      {section.title}
                    </Text>
                    <Text style={[styles.sectionSubText, { color: COLORS.sub }]}>
                      {sectionCompletedCount}/{sectionTotal} Completed
                    </Text>
                  </View>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color={COLORS.sub} />
                </TouchableOpacity>

                {/* Chapters List */}
                {isExpanded && (
                  <View style={[styles.chaptersContainer, { borderTopColor: COLORS.border }]}>
                    {section.chapters.map((chapter) => {
                      const isCompleted = completedItems[chapter.id];
                      return (
                        <TouchableOpacity
                          key={chapter.id}
                          style={styles.chapterRow}
                          onPress={() => toggleItem(chapter.id)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              {
                                borderColor: isCompleted ? "#10b981" : COLORS.sub,
                                backgroundColor: isCompleted ? "#10b981" : "transparent",
                              },
                            ]}
                          >
                            {isCompleted && <Ionicons name="checkmark" size={16} color="#fff" />}
                          </View>
                          <Text
                            style={[
                              styles.chapterText,
                              {
                                color: isCompleted ? COLORS.sub : COLORS.text,
                                textDecorationLine: isCompleted ? "line-through" : "none",
                              },
                            ]}
                          >
                            {chapter.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: { padding: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
  },
  masterProgressBox: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: "900",
  },
  progressBarBg: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressSub: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
  sectionContainer: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "800",
  },
  sectionSubText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  chaptersContainer: {
    borderTopWidth: 1,
    padding: 16,
    paddingTop: 8,
  },
  chapterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chapterText: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
});
