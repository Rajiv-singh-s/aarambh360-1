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
  const { streaks, stats, loading: progressLoading, reload: reloadProgress } = useProgress();
  const [dailyTip, setDailyTip] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const [timeOffset, setTimeOffset] = useState(0);
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  const mcqStreak = streaks.find((item) => item.streakType === "MCQ");
  const userData = {
    name: profile?.profile.name ?? "Aspirant",
    streak: mcqStreak?.currentCount ?? 0,
    quizzesTaken: stats?.totalQuizzesTaken ?? 0,
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
      void reloadProgress();
    }, [reloadProgress])
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
        // Silently fallback to device time if API fails (e.g. rate limit, offline)
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

  const istTimestamp = dateTime.getTime() + (5.5 * 60 * 60 * 1000); 
  const istDate = new Date(istTimestamp);

  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const seconds = istDate.getUTCSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedTime = `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const formattedDate = `${days[istDate.getUTCDay()]}, ${istDate.getUTCDate()} ${months[istDate.getUTCMonth()]}`;

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
      <SafeContainer style={{ flex: 1 }} disableBottom={true}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            {/* Centered Name */}
            <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }]}>
              <Text style={[styles.greetTitle, { color: COLORS.text, fontSize: 18 }]}>Hi, {userData.name}!</Text>
            </View>
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
            <Text style={[styles.dateText, { color: COLORS.sub }]}>{formattedDate}   •   </Text>
            <Text style={[styles.timeText, { color: COLORS.accent }]}>{formattedTime}</Text>
          </View>

          <View style={styles.greetingBox}>
            <Text style={[styles.greetSub, { color: COLORS.sub }]}>
              💡 {dailyTip}
            </Text>
          </View>

          {/* AI MENTOR BANNER */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("AiMentorScreen")}
            style={{
              marginHorizontal: 16,
              marginTop: 16,
              borderRadius: 16,
              padding: 16,
              backgroundColor: COLORS.card,
              borderWidth: 1,
              borderColor: COLORS.accent,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ backgroundColor: isDark ? "rgba(6,182,212,0.15)" : "#e0f2fe", padding: 12, borderRadius: 12, marginRight: 12 }}>
              <Ionicons name="sparkles" size={24} color={COLORS.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text, marginRight: 6 }}>Ask UPSC Mentor</Text>
                <View style={{ backgroundColor: "#ef4444", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ color: "#fff", fontSize: 9, fontWeight: "900" }}>BETA</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: COLORS.sub, marginTop: 2 }}>Resolve your doubts instantly with AI</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.sub} />
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>Your Progress</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressCardNew, { backgroundColor: COLORS.card }]}>
              <Ionicons name="book-outline" size={18} color={COLORS.accent} />
              <Text style={styles.progressValueNew}>{userData.quizzesTaken}</Text>
              <Text style={styles.progressLabelNew}>Quizzes</Text>
            </View>
            <View style={[styles.progressCardNew, { backgroundColor: COLORS.card }]}>
              <Ionicons name="stats-chart-outline" size={18} color="#10B981" />
              <Text style={styles.progressValueNew}>{userData.accuracyRate}%</Text>
              <Text style={styles.progressLabelNew}>Accuracy</Text>
            </View>
            <TouchableOpacity
              style={[styles.progressCardNew, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("StreakScreen")}
            >
              <Ionicons name="flame" size={20} color="#F59E0B" />
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
                        <IconComponent name={iconName} size={16} color={COLORS.accent} />
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
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("LearnScreen")}
            >
              <Ionicons name="library-outline" size={26} color={COLORS.accent} />
              <Text style={styles.quickText}>Learn</Text>
            </TouchableOpacity>
            <View style={{ width: "30%" }} />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <LinearGradient
          colors={isDark ? ["#0f172a", "#1e293b"] : ["#ffffff", "#f1f5f9"]}
          style={[styles.bottomBar, { paddingBottom: insets.bottom, height: 72 + insets.bottom }]}
        >
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="home" size={22} color={COLORS.accent} />
            <Text style={[styles.tabLabel, { color: COLORS.accent }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("LearnScreen")}>
            <Ionicons name="library-outline" size={22} color={COLORS.sub} />
            <Text style={[styles.tabLabel, { color: COLORS.sub }]}>Learn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("MCQScreen")}>
            <Ionicons name="document-text-outline" size={22} color={COLORS.sub} />
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
  dateTimeBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 10 },
  dateText: { fontSize: 15 },
  timeText: { fontSize: 18, fontWeight: "700" },
  greetingBox: { marginHorizontal: 16, marginTop: 4, alignItems: "center" },
  greetTitle: { fontSize: 20, fontWeight: "800" },
  greetSub: { textAlign: "center", fontSize: 13, fontStyle: "italic" },
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
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  progressValueNew: { fontSize: 16, fontWeight: "800", marginTop: 2 },
  progressLabelNew: { fontSize: 10, marginTop: 2 },
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  recCardContent: {
    flex: 1,
  },
  recCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  recCardReason: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
});
