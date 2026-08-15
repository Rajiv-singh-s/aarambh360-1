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
  Easing,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import type { SubjectSummaryDto, TopicSummaryDto } from "@aarambh360/types";
import { useSubjects } from "../hooks/useContent";
import { ListSkeleton } from "../components/SkeletonLoader";
import { apiGet } from "../services/apiClient";

const { width, height } = Dimensions.get("window");
const mcqCounts = [10, 20, 25, 50];

// Animated Touchable Card
const AnimatedCard = ({ subject, getIcon, onPress, index }: { subject: SubjectSummaryDto, getIcon: any, onPress: any, index: number }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const isDark = useColorScheme() === "dark";
  const COLORS = {
    card: isDark ? "rgba(30,41,59,0.7)" : "rgba(255,255,255,0.7)",
    accent: isDark ? "#0ea5e9" : "#0284c7",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    glassBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
  };

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.exp), useNativeDriver: true })
      ])
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale }] }}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPressIn={onPressIn} 
        onPressOut={onPressOut} 
        onPress={() => onPress(subject)}
        style={{ marginBottom: 16 }}
      >
        <BlurView intensity={isDark ? 30 : 60} tint={isDark ? "dark" : "light"} style={[styles.subjectCard, { borderColor: COLORS.glassBorder }]}>
          <View style={styles.cardContent}>
            <View style={styles.iconCircle}>
              <View style={styles.iconGlow} />
              {getIcon(subject.name)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: COLORS.text }]}>{subject.name}</Text>
              <Text style={[styles.cardSub, { color: COLORS.sub }]}>Choose a topic to begin</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.sub} />
          </View>
        </BlurView>
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
  
  const orb1Y = useRef(new Animated.Value(0)).current;
  const orb2Y = useRef(new Animated.Value(0)).current;

  const isDark = useColorScheme() === "dark";

  const COLORS = {
    bg: (isDark ? ["#020617", "#0f172a"] : ["#f8fafc", "#e2e8f0"]) as [string, string],
    card: isDark ? "rgba(30,41,59,0.7)" : "rgba(255,255,255,0.7)",
    accent: isDark ? "#0ea5e9" : "#0284c7",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    glassBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
  };

  useEffect(() => {
    // Ambient floating orbs
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Y, { toValue: -50, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orb1Y, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Y, { toValue: 50, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orb2Y, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const getIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes("history")) return <FontAwesome5 name="landmark" size={24} color={COLORS.accent} />;
    if (s.includes("geography")) return <Ionicons name="earth" size={26} color={COLORS.accent} />;
    if (s.includes("polity")) return <MaterialIcons name="account-balance" size={26} color={COLORS.accent} />;
    if (s.includes("economy")) return <Ionicons name="trending-up" size={26} color={COLORS.accent} />;
    return <Ionicons name="book" size={24} color={COLORS.accent} />;
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
    <View style={{ flex: 1, backgroundColor: COLORS.bg[0] }}>
      <Animated.View style={[styles.orb, { backgroundColor: "#0ea5e9", top: -100, left: -50, transform: [{ translateY: orb1Y }] }]} />
      <Animated.View style={[styles.orb, { backgroundColor: "#f59e0b", bottom: 100, right: -100, opacity: 0.15, transform: [{ translateY: orb2Y }] }]} />

      <LinearGradient colors={COLORS.bg} style={styles.safe}>
        <SafeContainer style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={[styles.headerText, { color: COLORS.text }]}>MCQ Practice</Text>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.text} />
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
                  getIcon={getIcon} 
                  onPress={handleSubjectPress} 
                  index={index} 
                />
              ))}
            </ScrollView>
          )}

          {/* Topic Selection Modal */}
          <Modal visible={topicModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <BlurView intensity={isDark ? 50 : 80} tint={isDark ? "dark" : "light"} style={[styles.modalBox, { borderColor: COLORS.glassBorder }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: COLORS.text }]}>Select Topic</Text>
                  <TouchableOpacity onPress={() => setTopicModalVisible(false)} style={styles.iconBtn}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {topics.map((topic) => (
                    <TouchableOpacity key={topic.id} style={[styles.modalItem, { borderBottomColor: COLORS.glassBorder }]} onPress={() => handleTopicSelect(topic)}>
                      <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "600" }}>{topic.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </BlurView>
            </View>
          </Modal>

          {/* Question Count Modal */}
          <Modal visible={countModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <BlurView intensity={isDark ? 50 : 80} tint={isDark ? "dark" : "light"} style={[styles.modalBox, { borderColor: COLORS.glassBorder }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: COLORS.text }]}>Question Count</Text>
                  <TouchableOpacity onPress={() => setCountModalVisible(false)} style={styles.iconBtn}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
                <View style={styles.countGrid}>
                  {mcqCounts.map((count) => (
                    <TouchableOpacity key={count} style={[styles.countCard, { backgroundColor: COLORS.card, borderColor: COLORS.glassBorder }]} onPress={() => handleMCQSelect(count)}>
                      <LinearGradient
                        colors={["rgba(14,165,233,0.1)", "transparent"]}
                        style={StyleSheet.absoluteFill}
                      />
                      <Text style={{ color: COLORS.accent, fontWeight: "900", fontSize: 24 }}>{count}</Text>
                      <Text style={{ color: COLORS.sub, fontSize: 12, fontWeight: "700" }}>Questions</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </BlurView>
            </View>
          </Modal>
        </SafeContainer>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  orb: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    zIndex: 10,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerText: { fontSize: 22, fontWeight: "900", letterSpacing: 0.5 },
  scrollContainer: { padding: 16, paddingBottom: 100 },
  
  subjectCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(14,165,233,0.1)",
  },
  iconGlow: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#0ea5e9",
    opacity: 0.2,
    transform: [{ scale: 1.5 }],
  },
  cardTitle: { fontSize: 19, fontWeight: "800", marginBottom: 4, letterSpacing: 0.5 },
  cardSub: { fontSize: 13, fontWeight: "600" },
  
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalBox: { 
    borderRadius: 28, 
    padding: 24, 
    maxHeight: "80%", 
    width: "88%", 
    borderWidth: 1,
    overflow: "hidden" 
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: "900", letterSpacing: 0.5 },
  modalItem: { paddingVertical: 16, borderBottomWidth: 1 },
  
  countGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
    marginTop: 10,
  },
  countCard: {
    width: "45%",
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  }
});
