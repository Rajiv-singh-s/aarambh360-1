import SafeContainer from '../components/SafeContainer';
// src/screens/ExamHomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialIcons, FontAwesome5, Entypo } from "@expo/vector-icons";
import { auth } from "../firebaseConfig";
import { useAuth } from "../hooks/useAuth";
import { useProgress } from "../hooks/useProgress";
import { useFocusEffect } from "@react-navigation/native";
import { getRecommendations } from "../services/analyticsService";
import type { RecommendationDto } from "@aarambh360/types";

export default function ExamHomeScreen({ navigation, route }: any) {
  const exam = route?.params?.exam || "UPSC";
  const { profile, loading: authLoading } = useAuth();
  const { streaks, stats, loading: progressLoading } = useProgress();
  const [dailyTip, setDailyTip] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const [timeOffset, setTimeOffset] = useState(0);
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  const mcqStreak = streaks.find((item) => item.streakType === "MCQ");
  const userData = {
    name: profile?.profile.name ?? "Aspirant",
    streak: mcqStreak?.currentCount ?? 0,
    quizzesTaken: stats?.totalQuestionsAnswered ?? 0,
    accuracyRate: stats?.accuracy ?? 0,
  };
  const loading = authLoading || progressLoading;

  const [recommendations, setRecommendations] = useState<RecommendationDto[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recError, setRecError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setRecLoading(true);
    setRecError(null);
    try {
      const data = await getRecommendations();
      setRecommendations(data.recommendations ?? []);
    } catch (err: any) {
      console.error("Failed to fetch recommendations:", err);
      setRecError(err.message ?? "Failed to load recommendations");
    } finally {
      setRecLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRecommendations();
    }, [])
  );

  const TIPS = [
    "Revise 20 MCQs daily — consistency beats intensity.",
    "Focus on understanding, not just memorizing.",
    "Discipline is greater than motivation.",
    "Start small, but never skip your schedule.",
    "Trust your pace — steady progress wins.",
  ];

  const COLORS = {
    bg: isDark
      ? (["#0b1220", "#111b2e"] as [string, string])
      : (["#e9f3ff", "#ffffff"] as [string, string]),
    card: isDark ? "#1e293b" : "#e2e8f0",
    accent: isDark ? "#06b6d4" : "#0284c7",
    text: isDark ? "#fff" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };


  useEffect(() => {
    if (!auth.currentUser) {
      navigation.replace("Login");
      return;
    }

    // Fetch strict IST time from a public time API to calculate offset
    const fetchRealTime = async () => {
      try {
        // Use worldtimeapi for reliable unix timestamp to avoid Hermes ISO-8601 parsing errors
        const response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Kolkata");
        const data = await response.json();
        const serverTime = data.unixtime * 1000;
        const localTime = Date.now();
        setTimeOffset(serverTime - localTime);
      } catch (err) {
        console.warn("Failed to fetch server time, falling back to device time", err);
      }
    };

    fetchRealTime();

    const timer = setInterval(() => {
      setDateTime(new Date(Date.now() + timeOffset));
    }, 1000);
    return () => clearInterval(timer);
  }, [navigation, timeOffset]);

  useEffect(() => {
    if (profile) {
      setDailyTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    }
  }, [profile]);

  const formattedDate = dateTime.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formattedTime = dateTime.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Loading your dashboard…</Text>
      </View>
    );
  }

  if (exam !== "UPSC") {
    return (
      <SafeContainer style={styles.centered}>
        <Text style={{ fontSize: 25, fontWeight: "800", color: COLORS.text }}>
          {exam} Section
        </Text>
        <Text style={{ marginTop: 10, fontSize: 16, color: COLORS.sub }}>
          Content Coming Soon
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            paddingVertical: 12,
            paddingHorizontal: 28,
            backgroundColor: COLORS.accent,
            borderRadius: 12,
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeContainer>
    );
  }

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={[styles.avatarCircle, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("ProfileScreen")}
            >
              <Ionicons name="person-outline" size={20} color={COLORS.accent} />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerIcon}>
                <Ionicons name="trophy-outline" size={22} color={COLORS.accent} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}>
                <Ionicons name="notifications-outline" size={22} color={COLORS.accent} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dateTimeBox}>
            <Text style={[styles.dateText, { color: COLORS.sub }]}>{formattedDate}</Text>
            <Text style={[styles.timeText, { color: COLORS.accent }]}>{formattedTime}</Text>
          </View>

          <View style={styles.greetingBox}>
            <Text style={styles.greetEmoji}>👋</Text>
            <Text style={[styles.greetTitle, { color: COLORS.text }]}>
              {getGreeting()}, {userData.name} !!!
            </Text>
            <Text style={[styles.greetSub, { color: COLORS.sub }]}>
              Stay focused and conquer one topic at a time.
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>Your Progress</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressCardNew, { backgroundColor: COLORS.card }]}>
              <Ionicons name="book-outline" size={22} color={COLORS.accent} />
              <Text style={styles.progressValueNew}>{userData.quizzesTaken}</Text>
              <Text style={styles.progressLabelNew}>Quizzes</Text>
            </View>
            <View style={[styles.progressCardNew, { backgroundColor: COLORS.card }]}>
              <Ionicons name="stats-chart-outline" size={22} color="#10B981" />
              <Text style={styles.progressValueNew}>{userData.accuracyRate}%</Text>
              <Text style={styles.progressLabelNew}>Accuracy</Text>
            </View>
            <TouchableOpacity
              style={[styles.progressCardNew, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("StreakScreen")}
            >
              <Ionicons name="flame" size={24} color="#F59E0B" />
              <Text style={[styles.progressValueNew, { color: "#F59E0B" }]}>{userData.streak}</Text>
              <Text style={[styles.progressLabelNew, { color: "#b45309" }]}>MCQ Streak</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>Recommended for You</Text>
          {recLoading ? (
            <View style={styles.recStateBox}>
              <ActivityIndicator size="small" color={COLORS.accent} />
              <Text style={[styles.recStateText, { color: COLORS.sub }]}>Loading recommendations...</Text>
            </View>
          ) : recError ? (
            <View style={styles.recStateBox}>
              <Text style={[styles.recStateText, { color: "#ef4444" }]}>{recError}</Text>
              <TouchableOpacity style={[styles.retryBtn, { backgroundColor: COLORS.accent }]} onPress={fetchRecommendations}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : recommendations.length === 0 ? (
            <View style={styles.recStateBox}>
              <Text style={[styles.recStateText, { color: COLORS.sub }]}>All caught up! No recommendations today.</Text>
            </View>
          ) : (
            <View style={styles.recList}>
              {recommendations.map((rec, index) => {
                let iconName: any = "book-outline";
                let IconComponent: any = Ionicons;
                if (rec.type === "QUIZ") {
                  IconComponent = MaterialIcons;
                  iconName = "quiz";
                } else if (rec.type === "MAINS") {
                  IconComponent = Ionicons;
                  iconName = "create-outline";
                } else if (rec.type === "TOPIC") {
                  IconComponent = FontAwesome5;
                  iconName = "book-open";
                } else if (rec.type === "REVISION") {
                  IconComponent = Ionicons;
                  iconName = "refresh-outline";
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.recCard, { backgroundColor: COLORS.card }]}
                    onPress={() => {
                      if (rec.type === "QUIZ") {
                        navigation.navigate("MCQScreen");
                      } else if (rec.type === "MAINS") {
                        navigation.navigate("MainScreen");
                      } else if (rec.type === "TOPIC" || rec.type === "REVISION") {
                        if (rec.topicId) {
                          navigation.navigate("ChapterScreen", {
                            materialId: rec.topicId,
                            subject: "Recommended Topic",
                            chapter: rec.title,
                          });
                        } else {
                          navigation.navigate("NotesScreen");
                        }
                      }
                    }}
                  >
                    <View style={styles.recCardHeader}>
                      <View style={[styles.recIconCircle, { backgroundColor: COLORS.accent + "15" }]}>
                        <IconComponent name={iconName} size={20} color={COLORS.accent} />
                      </View>
                      <View style={styles.recCardContent}>
                        <Text style={[styles.recCardTitle, { color: COLORS.text }]}>{rec.title}</Text>
                        <Text style={[styles.recCardReason, { color: COLORS.sub }]}>{rec.reason}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <BlurView
            intensity={50}
            tint={isDark ? "dark" : "light"}
            style={[styles.tipCard, { borderColor: COLORS.accent }]}
          >
            <Text style={[styles.tipTitle, { color: COLORS.accent }]}>💡 Daily Tip</Text>
            <Text style={[styles.tipText, { color: COLORS.text }]}>{dailyTip}</Text>
          </BlurView>

          <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>Study Tools</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("MCQScreen")}
            >
              <MaterialIcons name="quiz" size={28} color={COLORS.accent} />
              <Text style={styles.quickText}>MCQs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("MainScreen")}
            >
              <Ionicons name="create-outline" size={28} color={COLORS.accent} />
              <Text style={styles.quickText}>Mains</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("SyllabusScreen")}
            >
              <FontAwesome5 name="list-alt" size={24} color={COLORS.accent} />
              <Text style={styles.quickText}>Syllabus</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("NcertScreen")}
            >
              <FontAwesome5 name="book-open" size={24} color={COLORS.accent} />
              <Text style={styles.quickText}>NCERTs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("ExamInfoScreen")}
            >
              <Ionicons name="information-circle-outline" size={26} color={COLORS.accent} />
              <Text style={styles.quickText}>Exam Info</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("CutOffScreen")}
            >
              <Ionicons name="stats-chart" size={26} color={COLORS.accent} />
              <Text style={styles.quickText}>Cut-Offs</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("StrategyScreen")}
            >
              <Entypo name="light-bulb" size={26} color={COLORS.accent} />
              <Text style={styles.quickText}>Strategy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("NotesScreen")}
            >
              <Ionicons name="document-text-outline" size={26} color={COLORS.accent} />
              <Text style={styles.quickText}>Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("PYQScreen")}
            >
              <FontAwesome5 name="clipboard-list" size={24} color={COLORS.accent} />
              <Text style={styles.quickText}>PYQs</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("NewsScreen")}
            >
              <Entypo name="news" size={26} color={COLORS.accent} />
              <Text style={styles.quickText}>News</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <LinearGradient
          colors={isDark ? ["#0f172a", "#1e293b"] : ["#ffffff", "#f1f5f9"]}
          style={[styles.bottomBar, { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 24) : insets.bottom, height: 72 + (Platform.OS === 'android' ? Math.max(insets.bottom, 24) : insets.bottom) }]}
        >
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="home" size={22} color={COLORS.accent} />
            <Text style={[styles.tabLabel, { color: COLORS.accent }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("MCQScreen")}>
            <Ionicons name="book-outline" size={22} color={COLORS.sub} />
            <Text style={[styles.tabLabel, { color: COLORS.sub }]}>Prelims</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("MainScreen")}>
            <Ionicons name="create-outline" size={22} color={COLORS.sub} />
            <Text style={[styles.tabLabel, { color: COLORS.sub }]}>Mains</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("ProfileScreen")}>
            <Ionicons name="person-outline" size={22} color={COLORS.sub} />
            <Text style={[styles.tabLabel, { color: COLORS.sub }]}>Profile</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#94a3b8", marginTop: 10 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: { flexDirection: "row" },
  headerIcon: { marginLeft: 14 },
  dateTimeBox: { alignItems: "center", marginTop: 10 },
  dateText: { fontSize: 15 },
  timeText: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  greetingBox: { marginHorizontal: 16, marginTop: 10, alignItems: "center" },
  greetEmoji: { fontSize: 26 },
  greetTitle: { fontSize: 22, fontWeight: "800", marginTop: 4 },
  greetSub: { marginTop: 4, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 20, marginLeft: 16 },
  tipCard: {
    borderRadius: 16,
    margin: 16,
    padding: 16,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  tipTitle: { fontWeight: "700", fontSize: 15 },
  tipText: { marginTop: 4 },
  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginHorizontal: 16,
  },
  quickCard: {
    paddingVertical: 20,
    borderRadius: 14,
    alignItems: "center",
    width: "30%",
  },
  quickText: { marginTop: 6, fontWeight: "600" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    height: 72,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
  },
  tab: { alignItems: "center" },
  tabLabel: { fontSize: 12, marginTop: 4 },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 12,
  },
  progressCardNew: {
    width: "31%",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    elevation: 3,
  },
  progressValueNew: { fontSize: 20, fontWeight: "800", marginTop: 6 },
  progressLabelNew: { fontSize: 12, marginTop: 4 },
  recStateBox: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.15)",
  },
  recStateText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 4,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  recList: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  recCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  recCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  recIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recCardContent: {
    flex: 1,
  },
  recCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  recCardReason: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});
