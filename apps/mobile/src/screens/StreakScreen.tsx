// src/screens/StreakScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  useColorScheme,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeContainer from "../components/SafeContainer";
import { ListSkeleton } from "../components/SkeletonLoader";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useProgress } from "../hooks/useProgress";
import ConfettiCannon from "react-native-confetti-cannon";
import Animated, { FadeInDown, FadeIn, Easing, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";

const { width } = Dimensions.get("window");

export default function StreakScreen({ navigation }: any) {
  const { streaks, stats, loading } = useProgress();
  const mcqStreak = streaks.find((item) => item.streakType === "MCQ");
  const streakCount = mcqStreak?.currentCount ?? 0;
  
  const streakDates = stats?.activityDates || [];
  const longestStreak = stats?.longestStreak || 0;
  const totalStudyDays = streakDates.length;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  // Reanimated pulse for the flame
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Dynamic Colors for Ultra Premium feel
  const COLORS = {
    bg: (isDark ? ["#020617", "#0f172a"] : ["#f8fafc", "#e2e8f0"]) as [string, string],
    card: isDark ? "rgba(30,41,59,0.8)" : "rgba(255,255,255,0.8)",
    accent: isDark ? "#0ea5e9" : "#0284c7",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    glassBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    activeCellBg: isDark ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.15)",
    cellBg: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
  };

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
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  // Milestones Calculation
  const milestones = [
    { title: "7-Day Scholar", required: 7, icon: "shield-checkmark" as const },
    { title: "21-Day Habit", required: 21, icon: "flash" as const },
    { title: "50-Day Elite", required: 50, icon: "ribbon" as const },
    { title: "100-Day Legend", required: 100, icon: "trophy" as const },
  ];
  const unlockedMilestonesCount = milestones.filter(m => longestStreak >= m.required).length;
  
  // Progress Ring Calculation
  const nextMilestone = milestones.find(m => longestStreak < m.required) || milestones[milestones.length - 1];
  const previousMilestone = [...milestones].reverse().find(m => longestStreak >= m.required) || { required: 0 };
  const progressToNext = Math.min(1, Math.max(0, (longestStreak - previousMilestone.required) / (nextMilestone.required - previousMilestone.required || 1)));
  const ringCircumference = 2 * Math.PI * 65; // radius 65
  const strokeDashoffset = ringCircumference - progressToNext * ringCircumference;

  const shareStreak = async () => {
    try {
      const msg = `🔥 I'm on a ${streakCount}-day study streak using Aarambh360! Next stop: ${nextMilestone.title}. #UPSC`;
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
            <View style={{ width: 24 }} />
          </View>
          <ListSkeleton />
        </SafeContainer>
      </LinearGradient>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg[0] }}>
      {/* Aurora Background Orbs */}
      <View style={[styles.orb, { backgroundColor: "#0ea5e9", top: -100, left: -50 }]} />
      <View style={[styles.orb, { backgroundColor: "#f59e0b", top: 200, right: -100, opacity: 0.15 }]} />
      
      <LinearGradient colors={COLORS.bg} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
        <SafeContainer>
          {streakCount > 0 && (
            <ConfettiCannon count={50} origin={{ x: width / 2, y: -20 }} fallSpeed={2500} fadeOut />
          )}
          
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: COLORS.text }]}>Journey</Text>
            <TouchableOpacity onPress={shareStreak} style={styles.iconBtn}>
              <Ionicons name="share-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </Animated.View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            
            {/* Massive Circular Progress Flame */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.ringContainer}>
              <View style={styles.svgWrapper}>
                <Svg width={180} height={180} viewBox="0 0 160 160">
                  <Defs>
                    <SvgGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0" stopColor="#f59e0b" />
                      <Stop offset="1" stopColor="#f43f5e" />
                    </SvgGradient>
                  </Defs>
                  {/* Background Track */}
                  <Circle cx="80" cy="80" r="65" stroke={COLORS.glassBorder} strokeWidth="8" fill="none" />
                  {/* Active Progress */}
                  <Circle
                    cx="80"
                    cy="80"
                    r="65"
                    stroke="url(#ringGrad)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                  />
                </Svg>
                
                {/* Flame & Count */}
                <Animated.View style={[styles.flameCenter, animatedFlameStyle]}>
                  <Ionicons name="flame" size={56} color="#f59e0b" style={styles.flameIconGlow} />
                  <Text style={[styles.ringCountText, { color: COLORS.text }]}>{streakCount}</Text>
                  <Text style={[styles.ringSubText, { color: COLORS.sub }]}>DAYS</Text>
                </Animated.View>
              </View>
              
              <Text style={[styles.ringCaption, { color: COLORS.text }]}>
                {longestStreak >= nextMilestone.required 
                  ? "All milestones conquered! 👑" 
                  : `${nextMilestone.required - longestStreak} days to ${nextMilestone.title}`}
              </Text>
            </Animated.View>

            {/* Heatmap Calendar */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <BlurView intensity={isDark ? 30 : 60} tint={isDark ? "dark" : "light"} style={[styles.glassCard, { borderColor: COLORS.glassBorder }]}>
                <View style={styles.monthHeader}>
                  <TouchableOpacity onPress={() => handleMonthChange("prev")} style={styles.monthArrow}>
                    <Ionicons name="chevron-back" size={20} color={COLORS.text} />
                  </TouchableOpacity>
                  <Text style={[styles.monthTitle, { color: COLORS.text }]}>{getMonthName(currentMonth)}</Text>
                  <TouchableOpacity onPress={() => handleMonthChange("next")} style={styles.monthArrow}>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.weekRow}>
                  {weekdays.map((d, idx) => (
                    <Text key={idx} style={[styles.weekText, { color: COLORS.sub }]}>{d}</Text>
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
                              borderColor: isToday ? "#10b981" : isActive ? "rgba(16,185,129,0.3)" : "transparent",
                              borderWidth: isToday ? 1.5 : isActive ? 1 : 0,
                            },
                          ]}
                        >
                          <Text style={[styles.dayNum, { color: isActive ? "#10b981" : COLORS.text, fontWeight: isActive ? "800" : "500" }]}>
                            {d}
                          </Text>
                          {isActive && <View style={styles.activeDot} />}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </BlurView>
            </Animated.View>

            {/* Lifetime Stats */}
            <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.statsRow}>
              <BlurView intensity={isDark ? 30 : 60} tint={isDark ? "dark" : "light"} style={[styles.statBox, { borderColor: COLORS.glassBorder }]}>
                <View style={[styles.statIconWrap, { backgroundColor: "rgba(16,185,129,0.1)" }]}>
                  <Ionicons name="trending-up" size={22} color="#10b981" />
                </View>
                <Text style={[styles.statValue, { color: COLORS.text }]}>{longestStreak}</Text>
                <Text style={[styles.statLabel, { color: COLORS.sub }]}>Best Streak</Text>
              </BlurView>
              <BlurView intensity={isDark ? 30 : 60} tint={isDark ? "dark" : "light"} style={[styles.statBox, { borderColor: COLORS.glassBorder }]}>
                <View style={[styles.statIconWrap, { backgroundColor: "rgba(14,165,233,0.1)" }]}>
                  <Ionicons name="calendar" size={22} color="#0ea5e9" />
                </View>
                <Text style={[styles.statValue, { color: COLORS.text }]}>{totalStudyDays}</Text>
                <Text style={[styles.statLabel, { color: COLORS.sub }]}>Total Days</Text>
              </BlurView>
            </Animated.View>

            {/* Milestones Scroll */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Trophies</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {milestones.map((m, idx) => {
                  const isUnlocked = longestStreak >= m.required;
                  return (
                    <BlurView 
                      key={idx} 
                      intensity={isDark ? 30 : 60} 
                      tint={isDark ? "dark" : "light"}
                      style={[
                        styles.milestoneCard, 
                        { 
                          borderColor: isUnlocked ? "rgba(245,158,11,0.5)" : COLORS.glassBorder,
                          opacity: isUnlocked ? 1 : 0.6,
                        }
                      ]}
                    >
                      {isUnlocked && <View style={styles.milestoneGlow} />}
                      <Ionicons name={isUnlocked ? m.icon : `${m.icon}-outline`} size={36} color={isUnlocked ? "#f59e0b" : COLORS.sub} />
                      <Text style={[styles.milestoneText, { color: isUnlocked ? COLORS.text : COLORS.sub }]}>{m.title}</Text>
                      <Text style={[styles.milestoneSub, { color: isUnlocked ? "#f59e0b" : COLORS.sub }]}>
                        {isUnlocked ? "Achieved" : `${longestStreak}/${m.required} Days`}
                      </Text>
                    </BlurView>
                  );
                })}
              </ScrollView>
            </Animated.View>

          </ScrollView>
        </SafeContainer>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
    transform: [{ scale: 1.5 }],
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
  headerTitle: { fontSize: 22, fontWeight: "900", letterSpacing: 0.5 },

  ringContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  svgWrapper: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  flameCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  flameIconGlow: {
    textShadowColor: 'rgba(245, 158, 11, 0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  ringCountText: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: -4,
  },
  ringSubText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: -2,
  },
  ringCaption: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "700",
    opacity: 0.9,
  },

  glassCard: {
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  monthHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  monthArrow: { padding: 4, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12 },
  monthTitle: { fontWeight: "800", fontSize: 18, letterSpacing: 0.5 },
  
  weekRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  weekText: { fontSize: 13, fontWeight: "800", width: 34, textAlign: "center" },

  dayCell: {
    width: 34,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNum: { fontSize: 13 },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10b981',
  },

  statsRow: { flexDirection: "row", paddingHorizontal: 16, marginTop: 16, gap: 12 },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 26, fontWeight: "900", letterSpacing: 0.5 },
  statLabel: { fontSize: 12, fontWeight: "700", marginTop: 2 },

  sectionTitle: { fontSize: 20, fontWeight: "900", marginLeft: 16, marginTop: 32, marginBottom: 16, letterSpacing: 0.5 },
  
  milestoneCard: {
    width: 140,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  milestoneGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(245,158,11,0.15)",
    top: -20,
  },
  milestoneText: { fontSize: 14, fontWeight: "800", textAlign: "center", marginTop: 12 },
  milestoneSub: { fontSize: 12, fontWeight: "700", marginTop: 4 },
});
