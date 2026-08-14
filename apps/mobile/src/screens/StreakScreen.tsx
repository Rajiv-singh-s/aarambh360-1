// src/screens/StreakScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Animated,
  useColorScheme,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeContainer from "../components/SafeContainer";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../firebaseConfig";
import { useProgress } from "../hooks/useProgress";

export default function StreakScreen({ navigation }: any) {
  const { streaks, loading } = useProgress();
  const mcqStreak = streaks.find((item) => item.streakType === "MCQ");
  const streakCount = mcqStreak?.currentCount ?? 0;
  const streakDates = mcqStreak?.lastActivityDate ? [mcqStreak.lastActivityDate] : [];
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  // Dynamic Colors
  const COLORS = {
    bg: (isDark
      ? ["#0b1220", "#111b2e"]
      : ["#e9f3ff", "#ffffff"]) as [string, string],

    card: isDark ? "#1e293b" : "#e2e8f0",
    accent: isDark ? "#06b6d4" : "#0284c7",
    text: isDark ? "#fff" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",

    streakBorder: isDark ? "#06b6d4" : "#0284c7",
    cellBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",

    activeCellBg: isDark ? "#22c55e33" : "#bbf7d033",
  };

  // Pulse animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Calendar helpers
  const getMonthName = (date: Date) =>
    date.toLocaleString("default", { month: "long", year: "numeric" });
  const getDaysInMonth = (m: number, y: number) =>
    new Date(y, m + 1, 0).getDate();
  const getFirstDay = (m: number, y: number) =>
    new Date(y, m, 1).getDay();

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
  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

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

  // Share streak
  const shareStreak = async () => {
    try {
      const msg = `🔥 I'm on a ${streakCount}-day study streak using Aarambh360! #UPSC #Motivation #Aarambh360`;
      await Share.share({ message: msg });
    } catch (err) {
      console.error("Error sharing streak:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={[styles.loadingText, { color: COLORS.sub }]}>
          Loading your streak...
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={[COLORS.bg[0], COLORS.bg[1]]} style={{ flex: 1 }}>
      <SafeContainer>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.accent} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>
            Your Streak
          </Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Streak Card */}
          <Animated.View
            style={[styles.mainCard, { transform: [{ scale: pulseAnim }] }]}
          >
            <LinearGradient
              colors={
                isDark
                  ? ["#1e293b", "#0f172a"]
                  : ["#c7ddff", "#e7f1ff"]
              }
              style={styles.streakGradient}
            >
              <Ionicons name="flame" size={36} color="#f59e0b" />
              <Text
                style={[
                  styles.streakCount,
                  { color: isDark ? "#fbbf24" : "#b45309" },
                ]}
              >
                {streakCount}-Day Streak
              </Text>

              <Text
                style={[
                  styles.streakSub,
                  { color: COLORS.sub },
                ]}
              >
                {streakCount >= 3
                  ? "🔥 You’re unstoppable!"
                  : "Keep it going — small steps daily!"}
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Calendar */}
          <View
            style={[
              styles.monthCard,
              {
                backgroundColor: COLORS.card,
                borderColor: COLORS.streakBorder,
              },
            ]}
          >
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={() => handleMonthChange("prev")}>
                <Ionicons name="chevron-back" size={22} color={COLORS.accent} />
              </TouchableOpacity>

              <Text style={[styles.monthTitle, { color: COLORS.text }]}>
                {getMonthName(currentMonth)}
              </Text>

              <TouchableOpacity onPress={() => handleMonthChange("next")}>
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={COLORS.accent}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.monthSub, { color: COLORS.sub }]}>
              Completed {streakDates.filter((d) => d.startsWith(monthKey)).length}{" "}
              of {daysInMonth} days
            </Text>

            {/* Weekdays */}
            <View style={styles.weekRow}>
              {weekdays.map((d) => (
                <Text
                  key={d}
                  style={[styles.weekText, { color: COLORS.accent }]}
                >
                  {d}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                {week.map((d, di) => {
                  if (d === null)
                    return <View key={di} style={[styles.dayCell, { opacity: 0 }]} />;

                  const dateKey = `${monthKey}-${String(d).padStart(2, "0")}`;
                  const isActive = streakDates.includes(dateKey);
                  const isToday = dateKey === todayKey;

                  return (
                    <View
                      key={di}
                      style={[
                        styles.dayCell,
                        {
                          backgroundColor: isActive
                            ? COLORS.activeCellBg
                            : COLORS.cellBg,
                          borderColor: isToday
                            ? COLORS.accent
                            : isActive
                            ? "#22c55e"
                            : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNum,
                          {
                            color: isActive ? "#22c55e" : COLORS.text,
                          },
                        ]}
                      >
                        {d}
                      </Text>

                      {isActive && (
                        <Ionicons
                          name="flame"
                          size={10}
                          color="#f59e0b"
                          style={{ marginTop: 1 }}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Tip Card */}
          <LinearGradient
            colors={
              isDark ? ["#0f172a", "#1e293b"] : ["#e2efff", "#ffffff"]
            }
            style={[
              styles.tipCard,
              { borderColor: COLORS.accent },
            ]}
          >
            <Ionicons name="rocket-outline" size={18} color={COLORS.accent} />
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.tipTitle, { color: COLORS.accent }]}>
                Consistency Tip
              </Text>
              <Text style={[styles.tipText, { color: COLORS.sub }]}>
                Even one small study session counts toward your streak.
                Don’t break it 💪
              </Text>
            </View>
          </LinearGradient>

          {/* Share */}
          <TouchableOpacity style={styles.shareBtn} onPress={shareStreak}>
            <Ionicons name="share-social-outline" size={20} color={COLORS.accent} />
            <Text style={[styles.shareText, { color: COLORS.accent }]}>
              Share your streak
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },

  headerTitle: { fontSize: 18, fontWeight: "700" },

  mainCard: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#06b6d4",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },

  streakGradient: {
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },

  streakCount: { fontSize: 20, fontWeight: "900", marginTop: 2 },

  streakSub: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },

  monthCard: {
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 6,
    borderWidth: 1,
  },

  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  monthTitle: { fontWeight: "700", fontSize: 14 },
  monthSub: { marginTop: 2, marginBottom: 6, fontSize: 12 },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 4,
  },

  weekText: {
    fontSize: 11,
    fontWeight: "700",
    width: 30,
    textAlign: "center",
  },

  dayCell: {
    width: 30,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  dayNum: { fontSize: 11, fontWeight: "600" },

  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    borderWidth: 0.5,
  },

  tipTitle: { fontWeight: "700", fontSize: 14 },
  tipText: { marginTop: 2, lineHeight: 16, fontSize: 12 },

  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  shareText: { fontWeight: "700", marginLeft: 8 },
});
