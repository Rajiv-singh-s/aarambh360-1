// src/screens/StreakScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Animated,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeContainer from "../components/SafeContainer";
import { ListSkeleton } from "../components/SkeletonLoader";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useProgress } from "../hooks/useProgress";

export default function StreakScreen({ navigation }: any) {
  const { streaks, stats, loading } = useProgress();
  const mcqStreak = streaks.find((item) => item.streakType === "MCQ");
  const streakCount = mcqStreak?.currentCount ?? 0;
  
  // Real dates fetched from DB
  const streakDates = stats?.activityDates || [];
  const longestStreak = stats?.longestStreak || 0;
  const totalStudyDays = streakDates.length;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  // Dynamic Colors
  const COLORS = {
    bg: (isDark ? ["#0b1220", "#111b2e"] : ["#e9f3ff", "#ffffff"]) as [string, string],
    card: isDark ? "rgba(30,41,59,0.7)" : "rgba(255,255,255,0.7)",
    accent: isDark ? "#06b6d4" : "#0284c7",
    text: isDark ? "#fff" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    streakBorder: isDark ? "rgba(6,182,212,0.5)" : "rgba(2,132,199,0.5)",
    cellBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    activeCellBg: isDark ? "rgba(34,197,94,0.2)" : "rgba(187,247,208,0.5)",
    glassBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
  };

  // Pulse animation for the flame card
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Calendar helpers
  const getMonthName = (date: Date) => date.toLocaleString("default", { month: "long", year: "numeric" });
  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (m: number, y: number) => new Date(y, m, 1).getDay();

  const handleMonthChange = (dir: "prev" | "next") => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + (dir === "next" ? 1 : -1));
    setCurrentMonth(newDate);
  };

  const month = currentMonth.getMonth();
  const year = currentMonth.getFullYear();
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDay(month, year);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  // Build weeks
  const weeks: (number | null)[][] = [];
  let day = 1;
  for (let i = 0; i < 6; i++) {
    const week: (number | null)[] = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) week.push(null);
      else if (day > daysInMonth) week.push(null);
      else {
        week.push(day);
        day++;
      }
    }
    weeks.push(week);
    if (day > daysInMonth) break;
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Milestones Calculation based on longestStreak
  const milestones = [
    { title: "7-Day Scholar", required: 7, icon: "shield-checkmark" as const },
    { title: "30-Day Master", required: 30, icon: "shield" as const },
    { title: "100-Day Legend", required: 100, icon: "trophy" as const },
  ];
  const unlockedMilestonesCount = milestones.filter(m => longestStreak >= m.required).length;

  const shareStreak = async () => {
    try {
      const msg = `🔥 I'm on a ${streakCount}-day study streak using Aarambh360! #UPSC #Motivation`;
      await Share.share({ message: msg });
    } catch (err) {
      console.error("Error sharing streak:", err);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={COLORS.bg} style={{ flex: 1 }}>
        <SafeContainer>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={24} color={COLORS.accent} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: COLORS.text }]}>My Streak</Text>
            <Ionicons name="share-social-outline" size={24} color="transparent" />
          </View>
          <ListSkeleton />
        </SafeContainer>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.bg} style={{ flex: 1 }}>
      <SafeContainer>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.accent} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Your Streak</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Main Streak Card - Glassmorphism & Pulse */}
          <Animated.View style={[styles.mainCardContainer, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={isDark ? ["#1e293b", "#0f172a"] : ["#c7ddff", "#e7f1ff"]}
              style={styles.streakGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={styles.streakGlass}>
                <Ionicons name="flame" size={48} color="#f59e0b" style={styles.flameIcon} />
                <Text style={[styles.streakCount, { color: isDark ? "#fbbf24" : "#b45309" }]}>
                  {streakCount}-Day Streak
                </Text>
                <Text style={[styles.streakSub, { color: COLORS.sub }]}>
                  {streakCount >= 3 ? "🔥 You’re unstoppable!" : "Keep it going — small steps daily!"}
                </Text>
              </BlurView>
            </LinearGradient>
          </Animated.View>

          {/* Calendar Box */}
          <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={[styles.monthCard, { borderColor: COLORS.glassBorder }]}>
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={() => handleMonthChange("prev")}>
                <Ionicons name="chevron-back" size={22} color={COLORS.accent} />
              </TouchableOpacity>
              <Text style={[styles.monthTitle, { color: COLORS.text }]}>{getMonthName(currentMonth)}</Text>
              <TouchableOpacity onPress={() => handleMonthChange("next")}>
                <Ionicons name="chevron-forward" size={22} color={COLORS.accent} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.monthSub, { color: COLORS.sub }]}>
              Completed {streakDates.filter((d) => d.startsWith(monthKey)).length} of {daysInMonth} days
            </Text>

            <View style={styles.weekRow}>
              {weekdays.map((d) => (
                <Text key={d} style={[styles.weekText, { color: COLORS.accent }]}>{d}</Text>
              ))}
            </View>

            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                {week.map((d, di) => {
                  if (d === null) return <View key={di} style={[styles.dayCell, { opacity: 0 }]} />;

                  const dateKey = `${monthKey}-${String(d).padStart(2, "0")}`;
                  const isActive = streakDates.includes(dateKey);
                  const isToday = dateKey === todayKey;

                  return (
                    <View
                      key={di}
                      style={[
                        styles.dayCell,
                        {
                          backgroundColor: isActive ? COLORS.activeCellBg : COLORS.cellBg,
                          borderColor: isToday ? COLORS.accent : isActive ? "rgba(34,197,94,0.5)" : "transparent",
                          borderWidth: isToday || isActive ? 1 : 0,
                        },
                      ]}
                    >
                      <Text style={[styles.dayNum, { color: isActive ? "#22c55e" : COLORS.text, fontWeight: isActive ? "800" : "600" }]}>
                        {d}
                      </Text>
                      {isActive && <Ionicons name="flame" size={10} color="#f59e0b" style={{ position: 'absolute', top: 2, right: 2 }} />}
                    </View>
                  );
                })}
              </View>
            ))}
          </BlurView>

          {/* Dynamic Milestones */}
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Milestones</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {milestones.map((m, idx) => {
              const isUnlocked = longestStreak >= m.required;
              return (
                <BlurView 
                  key={idx} 
                  intensity={30} 
                  tint={isDark ? "dark" : "light"}
                  style={[
                    styles.milestoneCard, 
                    { 
                      borderColor: isUnlocked ? "#f59e0b" : COLORS.glassBorder,
                      opacity: isUnlocked ? 1 : 0.6,
                      borderWidth: isUnlocked ? 1.5 : 1
                    }
                  ]}
                >
                  <Ionicons name={isUnlocked ? m.icon : `${m.icon}-outline`} size={32} color={isUnlocked ? "#f59e0b" : COLORS.sub} />
                  <Text style={[styles.milestoneText, { color: isUnlocked ? COLORS.text : COLORS.sub }]}>{m.title}</Text>
                  <Text style={[styles.milestoneSub, { color: isUnlocked ? "#f59e0b" : COLORS.sub }]}>
                    {isUnlocked ? "Achieved" : `Locked (${longestStreak}/${m.required})`}
                  </Text>
                </BlurView>
              );
            })}
          </ScrollView>

          {/* Real Lifetime Stats */}
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Lifetime Stats</Text>
          <View style={styles.statsGrid}>
            <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={[styles.statBox, { borderColor: COLORS.glassBorder }]}>
              <Ionicons name="trending-up" size={26} color="#10b981" />
              <Text style={[styles.statValue, { color: COLORS.text }]}>{longestStreak}</Text>
              <Text style={[styles.statLabel, { color: COLORS.sub }]}>Longest Streak</Text>
            </BlurView>
            <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={[styles.statBox, { borderColor: COLORS.glassBorder }]}>
              <Ionicons name="calendar-outline" size={26} color="#06b6d4" />
              <Text style={[styles.statValue, { color: COLORS.text }]}>{totalStudyDays}</Text>
              <Text style={[styles.statLabel, { color: COLORS.sub }]}>Total Study Days</Text>
            </BlurView>
            <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={[styles.statBox, { borderColor: COLORS.glassBorder }]}>
              <Ionicons name="medal-outline" size={26} color="#fbbf24" />
              <Text style={[styles.statValue, { color: COLORS.text }]}>{unlockedMilestonesCount}</Text>
              <Text style={[styles.statLabel, { color: COLORS.sub }]}>Milestones</Text>
            </BlurView>
          </View>

          {/* Tip Card */}
          <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={[styles.tipCard, { borderColor: COLORS.glassBorder }]}>
            <Ionicons name="rocket-outline" size={22} color={COLORS.accent} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.tipTitle, { color: COLORS.accent }]}>Consistency Tip</Text>
              <Text style={[styles.tipText, { color: COLORS.sub }]}>
                Even one small study session counts toward your streak. Don’t break it 💪
              </Text>
            </View>
          </BlurView>

          {/* Share */}
          <TouchableOpacity style={styles.shareBtn} onPress={shareStreak}>
            <LinearGradient colors={["#06b6d4", "#3b82f6"]} style={styles.shareGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="share-social" size={20} color="#fff" />
              <Text style={styles.shareText}>Share your streak</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", letterSpacing: 0.5 },

  mainCardContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: "#06b6d4",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  streakGradient: {
    borderRadius: 20,
    overflow: "hidden",
  },
  streakGlass: {
    padding: 24,
    alignItems: "center",
  },
  flameIcon: {
    marginBottom: 8,
    textShadowColor: 'rgba(245, 158, 11, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  streakCount: { fontSize: 28, fontWeight: "900", letterSpacing: 1 },
  streakSub: { fontSize: 13, marginTop: 4, textAlign: "center", fontWeight: "600" },

  monthCard: {
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  monthHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  monthTitle: { fontWeight: "800", fontSize: 16, letterSpacing: 0.5 },
  monthSub: { marginTop: 4, marginBottom: 12, fontSize: 13, fontWeight: "500" },
  weekRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 6 },
  weekText: { fontSize: 12, fontWeight: "800", width: 32, textAlign: "center" },

  sectionTitle: { fontSize: 18, fontWeight: "800", marginLeft: 16, marginTop: 28, marginBottom: 12, letterSpacing: 0.5 },
  
  milestoneCard: {
    width: 130,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  milestoneText: { fontSize: 13, fontWeight: "800", textAlign: "center", marginTop: 10 },
  milestoneSub: { fontSize: 11, fontWeight: "700", marginTop: 4 },

  statsGrid: { flexDirection: "row", paddingHorizontal: 16, justifyContent: "space-between" },
  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    overflow: "hidden",
  },
  statValue: { fontSize: 24, fontWeight: "900", marginTop: 8 },
  statLabel: { fontSize: 11, fontWeight: "700", marginTop: 4, textAlign: "center" },

  dayCell: {
    width: 32,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNum: { fontSize: 12 },

  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  tipTitle: { fontWeight: "800", fontSize: 15, marginBottom: 2 },
  tipText: { lineHeight: 18, fontSize: 13, fontWeight: "500" },

  shareBtn: { marginTop: 24, marginHorizontal: 16, borderRadius: 20, overflow: 'hidden' },
  shareGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14 },
  shareText: { fontWeight: "800", color: "#fff", marginLeft: 8, fontSize: 16, letterSpacing: 0.5 },
});
