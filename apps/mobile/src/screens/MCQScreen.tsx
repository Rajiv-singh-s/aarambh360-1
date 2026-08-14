import SafeContainer from '../components/SafeContainer';
// src/screens/MCQScreen.tsx — subject/topic picker backed by NestJS API
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Animated,
  useColorScheme,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import type { SubjectSummaryDto, TopicSummaryDto } from "@aarambh360/types";
import { useSubjects } from "../hooks/useContent";
import { ListSkeleton } from "../components/SkeletonLoader";
import { apiGet } from "../services/apiClient";

const mcqCounts = [10, 20, 25, 50];

export default function MCQScreen({ navigation }: any) {
  const { data: subjects, loading: subjectsLoading } = useSubjects("UPSC_CSE");
  const [topics, setTopics] = useState<TopicSummaryDto[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectSummaryDto | null>(null);
  const [topicModalVisible, setTopicModalVisible] = useState(false);
  const [countModalVisible, setCountModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicSummaryDto | null>(null);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDark = useColorScheme() === "dark";

  const COLORS = {
    bg: isDark
      ? (["#0b1220", "#111b2e"] as const)
      : (["#e9f3ff", "#ffffff"] as const),
    card: isDark ? "#1e293b" : "#e2e8f0",
    accent: isDark ? "#06b6d4" : "#0284c7",
    text: isDark ? "#ffffff" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
  };

  const getIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes("history")) return <FontAwesome5 name="landmark" size={26} color={COLORS.accent} />;
    if (s.includes("geography")) return <Ionicons name="earth" size={28} color={COLORS.accent} />;
    if (s.includes("polity")) return <MaterialIcons name="account-balance" size={28} color={COLORS.accent} />;
    if (s.includes("economy")) return <Ionicons name="trending-up" size={26} color={COLORS.accent} />;
    return <Ionicons name="book-outline" size={26} color={COLORS.accent} />;
  };

  const handleSubjectPress = async (subject: SubjectSummaryDto) => {
    setSelectedSubject(subject);
    setLoadingTopics(true);
    try {
      const nextTopics = await apiGet<TopicSummaryDto[]>(`/subjects/${subject.id}/topics`);
      setTopics(nextTopics);
      setTopicModalVisible(true);
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleTopicSelect = (topic: TopicSummaryDto) => {
    setSelectedTopic(topic);
    setTopicModalVisible(false);
    setCountModalVisible(true);
  };

  const handleMCQSelect = (count: number) => {
    setCountModalVisible(false);
    navigation.navigate("QuizScreen", {
      topicId: selectedTopic?.id,
      subject: selectedSubject?.name ?? "General",
      subjectKey: selectedSubject?.code,
      count,
    });
  };

  const loading = subjectsLoading || loadingTopics;

  return (
    <LinearGradient colors={[COLORS.bg[0], COLORS.bg[1]]} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.accent} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: COLORS.text }]}>MCQ Practice</Text>
          <Ionicons name="information-circle-outline" size={22} color={COLORS.accent} />
        </View>

        {loading ? (
          <ListSkeleton />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {subjects.map((subject) => (
              <TouchableOpacity key={subject.id} activeOpacity={0.85} onPress={() => handleSubjectPress(subject)}>
                <View style={[styles.subjectCard, { backgroundColor: COLORS.card }]}>
                  <View style={[styles.iconCircle, { backgroundColor: COLORS.accent + "22" }]}>
                    {getIcon(subject.name)}
                  </View>
                  <Text style={[styles.cardTitle, { color: COLORS.text }]}>{subject.name}</Text>
                  <Text style={[styles.cardSub, { color: COLORS.sub }]}>Choose a topic</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Modal visible={topicModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: COLORS.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: COLORS.text }]}>Select Topic</Text>
                <TouchableOpacity onPress={() => setTopicModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={24} color={COLORS.sub} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {topics.map((topic) => (
                  <TouchableOpacity key={topic.id} style={styles.modalItem} onPress={() => handleTopicSelect(topic)}>
                    <Text style={{ color: COLORS.text, fontSize: 16 }}>{topic.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal visible={countModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: COLORS.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: COLORS.text }]}>Question Count</Text>
                <TouchableOpacity onPress={() => setCountModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={24} color={COLORS.sub} />
                </TouchableOpacity>
              </View>
              {mcqCounts.map((count) => (
                <TouchableOpacity key={count} style={styles.modalItem} onPress={() => handleMCQSelect(count)}>
                  <Text style={{ color: COLORS.text, fontWeight: "600", fontSize: 16 }}>{count} Questions</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: { fontSize: 18, fontWeight: "700" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: { padding: 16, paddingBottom: 80 },
  subjectCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 17, fontWeight: "700", flex: 1 },
  cardSub: { fontSize: 12 },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalBox: { borderRadius: 16, padding: 20, maxHeight: "70%", width: "85%", elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  modalItem: { paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#64748b33" },
});
