import SafeContainer from '../components/SafeContainer';
// src/screens/MCQScreen.tsx — subject/topic picker backed by NestJS API
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  useColorScheme,
  Easing,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { SubjectSummaryDto, TopicSummaryDto } from "@aarambh360/types";
import { useSubjects } from "../hooks/useContent";
import { ListSkeleton } from "../components/SkeletonLoader";
import { apiGet } from "../services/apiClient";

const { width } = Dimensions.get("window");
const mcqCounts = [10, 20, 25, 50];

// Themed palettes for subjects
const SUBJECT_THEMES: Record<string, { colors: [string, string], icon: string }> = {
  "history": { colors: ["#f97316", "#ea580c"], icon: "landmark" }, // Orange
  "geography": { colors: ["#10b981", "#059669"], icon: "earth" }, // Green
  "polity": { colors: ["#3b82f6", "#2563eb"], icon: "account-balance" }, // Blue
  "economy": { colors: ["#8b5cf6", "#7c3aed"], icon: "trending-up" }, // Purple
  "social science": { colors: ["#ec4899", "#db2777"], icon: "book-open" }, // Pink
  "default": { colors: ["#0ea5e9", "#0284c7"], icon: "book" } // Cyan
};

const getTheme = (name: string) => {
  const s = name.toLowerCase();
  for (const key in SUBJECT_THEMES) {
    if (s.includes(key)) return SUBJECT_THEMES[key];
  }
  return SUBJECT_THEMES["default"];
};

// Animated Themed Card
const AnimatedCard = ({ subject, onPress, index }: { subject: SubjectSummaryDto, onPress: any, index: number }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const theme = getTheme(subject.name);
  
  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 120),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.exp), useNativeDriver: true })
      ])
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale }] }}>
      <TouchableOpacity 
        activeOpacity={1} 
        onPressIn={onPressIn} 
        onPressOut={onPressOut} 
        onPress={() => onPress(subject)}
        style={styles.cardWrapper}
      >
        <LinearGradient
          colors={theme.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.subjectCard}
        >
          {/* Background decorative icon */}
          <View style={styles.bgIconWrapper}>
            {theme.icon === "earth" || theme.icon === "book" ? (
              <Ionicons name={theme.icon as any} size={140} color="rgba(255,255,255,0.15)" />
            ) : theme.icon === "account-balance" ? (
              <MaterialIcons name={theme.icon as any} size={140} color="rgba(255,255,255,0.15)" />
            ) : (
              <FontAwesome5 name={theme.icon as any} size={120} color="rgba(255,255,255,0.15)" />
            )}
          </View>

          <View style={styles.cardContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{subject.name}</Text>
              <Text style={styles.cardSub}>Tap to select a topic</Text>
            </View>
            <View style={styles.playBtn}>
              <Ionicons name="play" size={20} color={theme.colors[1]} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function MCQScreen({ navigation }: any) {
  const { data: subjects, loading: subjectsLoading } = useSubjects("UPSC_CSE");
  const [topics, setTopics] = useState<TopicSummaryDto[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectSummaryDto | null>(null);
  const [topicModalVisible, setTopicModalVisible] = useState(false);
  const [countModalVisible, setCountModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicSummaryDto | null>(null);
  const [loadingTopics, setLoadingTopics] = useState(false);
  
  const isDark = useColorScheme() === "dark";

  const COLORS = {
    bg: (isDark ? ["#020617", "#0f172a"] : ["#f8fafc", "#e2e8f0"]) as [string, string],
    card: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "#334155" : "#e2e8f0",
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
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: COLORS.card }]}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.headerSub, { color: COLORS.sub }]}>UPSC CSE</Text>
            <Text style={[styles.headerText, { color: COLORS.text }]}>Practice By Subject</Text>
          </View>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: COLORS.card }]}>
            <Ionicons name="filter" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ListSkeleton />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {subjects.map((subject, index) => (
              <AnimatedCard 
                key={subject.id} 
                subject={subject} 
                onPress={handleSubjectPress} 
                index={index} 
              />
            ))}
          </ScrollView>
        )}

        {/* Topic Selection Modal */}
        <Modal visible={topicModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setTopicModalVisible(false)} />
            <View style={[styles.bottomSheet, { backgroundColor: COLORS.card }]}>
              <View style={styles.sheetHandle} />
              <Text style={[styles.sheetTitle, { color: COLORS.text }]}>Select Topic</Text>
              <Text style={[styles.sheetSub, { color: COLORS.sub }]}>{selectedSubject?.name}</Text>
              
              <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 20 }}>
                {topics.length === 0 ? (
                  <Text style={{ textAlign: "center", color: COLORS.sub, marginTop: 40 }}>No topics available.</Text>
                ) : (
                  topics.map((topic) => (
                    <TouchableOpacity 
                      key={topic.id} 
                      style={[styles.topicItem, { borderBottomColor: COLORS.border }]} 
                      onPress={() => handleTopicSelect(topic)}
                    >
                      <Text style={[styles.topicText, { color: COLORS.text }]}>{topic.name}</Text>
                      <Ionicons name="chevron-forward" size={18} color={COLORS.sub} />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Question Count Modal */}
        <Modal visible={countModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.centeredModal, { backgroundColor: COLORS.card }]}>
              <Text style={[styles.centeredModalTitle, { color: COLORS.text }]}>How many questions?</Text>
              <Text style={[styles.centeredModalSub, { color: COLORS.sub }]}>Select the length of your practice session</Text>
              
              <View style={styles.countGrid}>
                {mcqCounts.map((count) => (
                  <TouchableOpacity 
                    key={count} 
                    style={[styles.countCard, { backgroundColor: COLORS.bg[0], borderColor: COLORS.border }]} 
                    onPress={() => handleMCQSelect(count)}
                  >
                    <Text style={[styles.countNum, { color: COLORS.text }]}>{count}</Text>
                    <Text style={{ color: COLORS.sub, fontSize: 13, fontWeight: "600" }}>Questions</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCountModalVisible(false)}>
                <Text style={{ color: COLORS.sub, fontWeight: "700", fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
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
    paddingTop: 12,
    paddingBottom: 20,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerSub: { fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  headerText: { fontSize: 20, fontWeight: "900", letterSpacing: 0.5 },
  
  scrollContainer: { padding: 16, paddingBottom: 100 },
  
  cardWrapper: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  subjectCard: {
    borderRadius: 24,
    overflow: "hidden",
    height: 140,
  },
  bgIconWrapper: {
    position: "absolute",
    right: -20,
    bottom: -20,
    transform: [{ rotate: "-15deg" }],
  },
  cardContent: {
    flex: 1,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { 
    fontSize: 24, 
    fontWeight: "900", 
    color: "#ffffff", 
    marginBottom: 6,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  cardSub: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "rgba(255,255,255,0.8)" 
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  
  modalOverlay: { 
    flex: 1, 
    justifyContent: "flex-end", 
    backgroundColor: "rgba(0,0,0,0.5)" 
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: { 
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24, 
    maxHeight: "85%",
    minHeight: "50%",
    width: "100%",
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 24, fontWeight: "900", letterSpacing: 0.5 },
  sheetSub: { fontSize: 15, fontWeight: "600", marginTop: 4 },
  
  topicItem: { 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18, 
    borderBottomWidth: 1 
  },
  topicText: {
    fontSize: 17,
    fontWeight: "600",
  },
  
  centeredModal: {
    alignSelf: "center",
    marginVertical: "auto",
    width: "88%",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
  },
  centeredModalTitle: { fontSize: 22, fontWeight: "900", marginBottom: 8, textAlign: "center" },
  centeredModalSub: { fontSize: 14, textAlign: "center", marginBottom: 24 },
  
  countGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  countCard: {
    width: "45%",
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  countNum: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 4,
  },
  cancelBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  }
});
