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
import { Ionicons, MaterialIcons, FontAwesome5, Entypo } from "@expo/vector-icons";
import { auth } from "../firebaseConfig";
import { useAuth } from "../hooks/useAuth";
import { useProgress } from "../hooks/useProgress";
import { useFocusEffect } from "@react-navigation/native";
import { getRecommendations } from "../services/analyticsService";
import { apiGet } from "../services/apiClient";
import type { RecommendationDto, DailyChallengeDto } from "@aarambh360/types";
import SafeContainer from "../components/SafeContainer";
import { HomeScreenSkeleton } from "../components/SkeletonLoader";

const PREMIUM_GRADIENTS: Record<string, [string, string]> = {
  "#8b5cf6": ["#8b5cf6", "#6d28d9"],
  "#f59e0b": ["#fbb86c", "#d97706"],
  "#f43f5e": ["#fb7185", "#be123c"],
  "#06b6d4": ["#22d3ee", "#0369a1"],
  "#10b981": ["#34d399", "#047857"],
  "#ef4444": ["#f87171", "#b91c1c"],
};

const PremiumCard = ({ icon, color, title, desc, onPress, IconLib = Ionicons }: any) => {
  const gradientColors = PREMIUM_GRADIENTS[color] || [color, color];
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ paddingBottom: 12 }}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.premiumCard, { shadowColor: color }]}
      >
        <View style={[styles.premiumIconBox, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
          <IconLib name={icon} size={32} color="#fff" />
        </View>
        <Text style={[styles.premiumCardTitle, { color: "#fff" }]}>{title}</Text>
        <Text style={[styles.premiumCardDesc, { color: "rgba(255,255,255,0.85)" }]}>{desc}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const ListItemCard = ({ icon, color, title, onPress, IconLib = Ionicons, COLORS }: any) => {
  return (
    <TouchableOpacity 
      style={[
        styles.listItemCard, 
        { 
          backgroundColor: COLORS.card, 
          borderColor: COLORS.border
        }
      ]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={[styles.listIconBox, { backgroundColor: color + "15" }]}>
        <IconLib name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.listText, { color: COLORS.text }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.sub} />
    </TouchableOpacity>
  );
};

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

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallengeDto[]>([]);
  const [allAttempted, setAllAttempted] = useState(false);
  const [timeLeftToMidnight, setTimeLeftToMidnight] = useState("");

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

  const fetchDailyChallenges = async () => {
    try {
      const data = await apiGet<DailyChallengeDto[]>("/daily-challenges/today");
      setDailyChallenges(data || []);
      
      const hasActive = data && data.length > 0;
      const allDone = hasActive && data.every(c => c.isAttempted);
      setAllAttempted(allDone);
      
      if (hasActive && !allDone) {
        setRecommendations(prev => {
          const filtered = prev.filter(r => r.title !== 'Daily Challenge');
          return [{
            type: 'QUIZ',
            title: 'Daily Challenge',
            reason: 'Complete all 3 sections of the Daily Challenge.'
          }, ...filtered];
        });
      } else if (allDone) {
        setRecommendations(prev => prev.filter(r => r.title !== 'Daily Challenge'));
      }
    } catch (err) {
      console.error("Failed to fetch daily challenges:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRecommendations();
      fetchDailyChallenges();
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
    card: isDark ? "#1e293b" : "#ffffff",
    accent: isDark ? "#06b6d4" : "#0284c7",
    text: isDark ? "#fff" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0",
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

    const fetchRealTime = async () => {
      try {
        const response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Kolkata");
        const data = await response.json();
        const serverTime = data.unixtime * 1000;
        const localTime = Date.now();
        setTimeOffset(serverTime - localTime);
      } catch (err) {}
    };

    fetchRealTime();

    const timer = setInterval(() => {
      const now = new Date(Date.now() + timeOffset);
      setDateTime(now);
      
      // Calculate time left to midnight IST
      const istTime = now.getTime() + (5.5 * 60 * 60 * 1000);
      const istDateCurrent = new Date(istTime);
      const tomorrowIST = new Date(istDateCurrent);
      tomorrowIST.setUTCHours(24, 0, 0, 0);
      
      const diff = tomorrowIST.getTime() - istDateCurrent.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeftToMidnight(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
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
      <LinearGradient colors={COLORS.bg} style={styles.safe}>
        <SafeContainer style={{ flex: 1 }} disableBottom={true}>
          <HomeScreenSkeleton />
        </SafeContainer>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }} disableBottom={true}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', flexDirection: 'row' }]}>
              <Text style={[styles.dateText, { color: COLORS.sub }]}>{formattedDate}   •   </Text>
              <Text style={[styles.timeText, { color: COLORS.accent }]}>{formattedTime}</Text>
            </View>
            <TouchableOpacity
              style={[styles.avatarCircle, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("ProfileScreen")}
            >
              <Ionicons name="person-outline" size={20} color={COLORS.accent} />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate("NotificationScreen")}>
                <Ionicons name="notifications-outline" size={22} color={COLORS.accent} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Daily Goals */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressCardNew, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
              <Ionicons name="book-outline" size={20} color={COLORS.accent} />
              <Text style={[styles.progressValueNew, { color: COLORS.text }]}>{userData.quizzesTaken}</Text>
              <Text style={[styles.progressLabelNew, { color: COLORS.sub }]}>Quizzes</Text>
            </View>
            <View style={[styles.progressCardNew, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
              <Ionicons name="stats-chart-outline" size={20} color="#10B981" />
              <Text style={[styles.progressValueNew, { color: COLORS.text }]}>{userData.accuracyRate}%</Text>
              <Text style={[styles.progressLabelNew, { color: COLORS.sub }]}>Accuracy</Text>
            </View>
            <TouchableOpacity
              style={[styles.progressCardNew, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
              onPress={() => navigation.navigate("StreakScreen")}
            >
              <Ionicons name="flame" size={20} color="#F59E0B" />
              <Text style={[styles.progressValueNew, { color: "#F59E0B" }]}>{userData.streak}</Text>
              <Text style={[styles.progressLabelNew, { color: "#b45309" }]}>MCQ Streak</Text>
            </TouchableOpacity>
          </View>

          {/* Daily Challenge Banner */}
          <TouchableOpacity 
            activeOpacity={allAttempted ? 1 : 0.9} 
            style={styles.dailyChallengeBanner}
            onPress={() => {
              if (!allAttempted) {
                navigation.navigate("DailyChallengeHubScreen");
              }
            }}
          >
            <LinearGradient
              colors={allAttempted ? (isDark ? ["#1e293b", "#334155"] : ["#cbd5e1", "#e2e8f0"]) : ["#f59e0b", "#d97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dailyChallengeGradient}
            >
              <View style={styles.dcContent}>
                <View>
                  <Text style={[styles.dcTitle, allAttempted && { color: COLORS.text }]}>🎯 Daily Challenge</Text>
                  {allAttempted ? (
                    <Text style={[styles.dcSub, { color: COLORS.sub, marginTop: 6 }]}>
                      Already attempted.{"\n"}Wait for next in <Text style={{fontWeight: '800', color: COLORS.accent}}>{timeLeftToMidnight}</Text>
                    </Text>
                  ) : (
                    <Text style={styles.dcSub}>Compete with peers • Win Streaks</Text>
                  )}
                </View>
                {!allAttempted && (
                  <View style={styles.dcPlayBtn}>
                    <Ionicons name="play" size={20} color="#d97706" />
                  </View>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Recommended */}
          {recommendations.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>Recommended for You</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {recommendations.map((rec, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.recCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
                    onPress={() => {
                      if (rec.title === 'Daily Challenge') {
                        navigation.navigate("DailyChallengeHubScreen");
                        return;
                      }
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
                    <Text style={[styles.recCardTitle, { color: COLORS.text }]} numberOfLines={2}>{rec.title}</Text>
                    <Text style={[styles.recCardReason, { color: COLORS.sub }]} numberOfLines={2}>{rec.reason}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Premium Features Carousel */}
          <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>Premium Features</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}>
            <PremiumCard icon="clipboard" color="#8b5cf6" title="Test Series" desc="Full mock exams" onPress={() => navigation.navigate("TestSeriesHubScreen")} COLORS={COLORS} />
            <PremiumCard icon="map" color="#f59e0b" title="Map Game" desc="Geography practice" onPress={() => navigation.navigate("MapPracticeScreen")} COLORS={COLORS} />
            <PremiumCard icon="play-circle" color="#f43f5e" title="News Reels" desc="Daily 60s shorts" onPress={() => navigation.navigate("NewsReelsScreen")} COLORS={COLORS} />
            <PremiumCard icon="albums" color="#06b6d4" title="Flashcards" desc="Spaced repetition" onPress={() => navigation.navigate("FlashcardsScreen")} COLORS={COLORS} />
            <PremiumCard icon="headset" color="#10b981" title="Study Room" desc="Focus timer" onPress={() => navigation.navigate("StudyRoomScreen")} COLORS={COLORS} />
            <PremiumCard icon="trophy" color="#ef4444" title="Leaderboard" desc="All-India ranks" onPress={() => navigation.navigate("LeaderboardScreen")} COLORS={COLORS} />
          </ScrollView>

          {/* Core Practice */}
          <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>Core Practice</Text>
          <ListItemCard icon="quiz" IconLib={MaterialIcons} color={COLORS.accent} title="Daily MCQs" onPress={() => navigation.navigate("MCQScreen")} COLORS={COLORS} />
          <ListItemCard icon="create-outline" color={COLORS.accent} title="Mains Answer Writing" onPress={() => navigation.navigate("MainScreen")} COLORS={COLORS} />
          <ListItemCard icon="clipboard-list" IconLib={FontAwesome5} color={COLORS.accent} title="Previous Year Papers" onPress={() => navigation.navigate("PYQScreen")} COLORS={COLORS} />

          {/* My Saved Items */}
          <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>My Saved Items</Text>
          <ListItemCard icon="bookmark" color={COLORS.accent} title="My Bookmarks" onPress={() => navigation.navigate("BookmarksScreen")} COLORS={COLORS} />
          <ListItemCard icon="flag" color={COLORS.accent} title="My Reports" onPress={() => navigation.navigate("ReportsScreen")} COLORS={COLORS} />

          {/* Study Materials */}
          <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>Study Materials</Text>
          <ListItemCard icon="book-open" IconLib={FontAwesome5} color={COLORS.accent} title="NCERT Books" onPress={() => navigation.navigate("NcertScreen")} COLORS={COLORS} />
          <ListItemCard icon="document-text-outline" color={COLORS.accent} title="Revision Notes" onPress={() => navigation.navigate("NotesScreen")} COLORS={COLORS} />
          <ListItemCard icon="document-text-outline" color={COLORS.accent} title="Cheat Sheet" onPress={() => navigation.navigate("CheatSheetScreen")} COLORS={COLORS} />
          <ListItemCard icon="bar-chart-outline" color={COLORS.accent} title="Syllabus Tracker" onPress={() => navigation.navigate("SyllabusTrackerScreen")} COLORS={COLORS} />

          {/* Resources & Strategy */}
          <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>Resources & Strategy</Text>
          <ListItemCard icon="warning-outline" color="#ef4444" title="Mistake Vault" onPress={() => navigation.navigate("WeaknessVaultScreen")} COLORS={COLORS} />
          <ListItemCard icon="list-alt" IconLib={FontAwesome5} color={COLORS.accent} title="Syllabus PDF" onPress={() => navigation.navigate("SyllabusScreen")} COLORS={COLORS} />
          <ListItemCard icon="light-bulb" IconLib={Entypo} color={COLORS.accent} title="Strategy" onPress={() => navigation.navigate("StrategyScreen")} COLORS={COLORS} />
          <ListItemCard icon="stats-chart" color={COLORS.accent} title="Cut-Offs" onPress={() => navigation.navigate("CutOffScreen")} COLORS={COLORS} />
          <ListItemCard icon="information-circle-outline" color={COLORS.accent} title="Exam Info" onPress={() => navigation.navigate("ExamInfoScreen")} COLORS={COLORS} />



          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Nav */}
        <LinearGradient
          colors={isDark ? ["#0f172a", "#1e293b"] : ["#ffffff", "#f8fafc"]}
          style={[styles.bottomBar, { paddingBottom: insets.bottom, height: 72 + insets.bottom, borderTopColor: COLORS.border }]}
        >
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="home" size={22} color={COLORS.accent} />
            <Text style={[styles.tabLabel, { color: COLORS.accent }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("LearnScreen")}>
            <Ionicons name="library-outline" size={22} color={COLORS.sub} />
            <Text style={[styles.tabLabel, { color: COLORS.sub }]}>Learn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("AiMentorScreen")}>
            <View style={[styles.floatingTab, { backgroundColor: COLORS.accent }]}>
              <Ionicons name="sparkles" size={22} color="#fff" />
            </View>
            <Text style={[styles.tabLabel, { color: COLORS.accent, marginTop: 4, fontWeight: "800" }]}>Mentor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("NewsScreen")}>
            <Entypo name="news" size={22} color={COLORS.sub} />
            <Text style={[styles.tabLabel, { color: COLORS.sub }]}>News</Text>
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
  dateText: { fontSize: 14, fontWeight: "500" },
  timeText: { fontSize: 16, fontWeight: "700" },
  greetingBox: { marginHorizontal: 16, marginTop: 4, alignItems: "center" },
  greetTitle: { fontSize: 18, fontWeight: "800" },
  greetSub: { textAlign: "center", fontSize: 13, fontStyle: "italic", marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginTop: 20, marginBottom: 10, marginLeft: 16 },
  
  aiMentorBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  aiIconBox: { padding: 12, borderRadius: 12, marginRight: 12 },
  aiBannerTitle: { fontSize: 16, fontWeight: "800", marginRight: 6 },
  betaBadge: { backgroundColor: "#ef4444", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  betaText: { color: "#fff", fontSize: 9, fontWeight: "900" },

  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 10,
  },
  progressCardNew: {
    width: "31%",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
  },
  progressValueNew: { fontSize: 15, fontWeight: "800", marginTop: 2 },
  progressLabelNew: { fontSize: 10, fontWeight: "500", marginTop: 1 },

  dailyChallengeBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  dailyChallengeGradient: {
    borderRadius: 16,
    padding: 16,
  },
  dcContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dcTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  dcSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  dcPlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  premiumCard: {
    width: 130,
    height: 130,
    borderRadius: 18,
    padding: 14,
    marginRight: 10,
    borderWidth: 0,
    justifyContent: "center",
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  premiumIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  premiumCardTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  premiumCardDesc: { fontSize: 10, fontWeight: "500" },

  listItemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  listIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  listText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },

  recCard: {
    width: 240,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: 10,
  },
  recCardTitle: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  recCardReason: { fontSize: 11, lineHeight: 16 },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    elevation: 8,
  },
  tab: { alignItems: "center" },
  floatingTab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -16,
    elevation: 4,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabLabel: { fontSize: 11, fontWeight: "600", marginTop: 4 },
});
