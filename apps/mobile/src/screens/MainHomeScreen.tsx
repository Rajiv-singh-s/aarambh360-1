import SafeContainer from '../components/SafeContainer';
// src/screens/MainHomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Entypo,
} from "@expo/vector-icons";

import { getRecommendations } from "../services/analyticsService";
import type { RecommendationDto } from "@aarambh360/types";
import { HomeScreenSkeleton } from "../components/SkeletonLoader";

import { auth } from "../firebaseConfig";
import { useAuth } from "../hooks/useAuth";
import AdBanner from "../components/AdBanner";

export default function MainHomeScreen({ navigation }: any) {
  const { profile, loading } = useAuth();
  const userData = profile?.profile;
  const [dailyTip, setDailyTip] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const isDark = useColorScheme() === "dark";

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
    const user = auth.currentUser;
    if (!user) {
      navigation.replace("Login");
      return;
    }
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [navigation]);

  useEffect(() => {
    if (userData) {
      setDailyTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    }
  }, [userData]);

  const formattedDate = dateTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formattedTime = dateTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (loading || !userData) {
    return (
      <LinearGradient colors={[COLORS.bg[0], COLORS.bg[1]]} style={styles.safe}>
        <SafeContainer style={{ flex: 1 }} disableBottom={true}>
          <HomeScreenSkeleton />
        </SafeContainer>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.bg[0], COLORS.bg[1]]}
      style={styles.safe}
    >
      <SafeContainer style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* HEADER */}
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

          {/* DATE + TIME */}
          <View style={styles.dateTimeBox}>
            <Text style={[styles.dateText, { color: COLORS.sub }]}>
              {formattedDate} |{" "}
              <Text style={[styles.timeText, { color: COLORS.accent }]}>
                {formattedTime}
              </Text>
            </Text>
          </View>

          {/* GREETING */}
          <View style={styles.greetingBox}>
            <Text style={styles.greetEmoji}>
              👋
              <Text style={[styles.greetTitle, { color: COLORS.text }]}>
                {" "}{getGreeting()}, {userData?.name || "Aspirant"} !!!
              </Text>
            </Text>
            <Text style={[styles.greetSub, { color: COLORS.sub }]}>
              "Choose your exam and begin your preparation."
            </Text>
          </View>

          {/* DAILY TIP */}
          <BlurView
            intensity={50}
            tint={isDark ? "dark" : "light"}
            style={[styles.tipCard, { borderColor: COLORS.accent }]}
          >
            <Text style={[styles.tipTitle, { color: COLORS.accent }]}>💡 Daily Tip</Text>
            <Text style={[styles.tipText, { color: COLORS.text }]}>{dailyTip}</Text>
          </BlurView>

          <View style={{ marginHorizontal: 16 }}>
            <AdBanner placementId="home_banner" />
          </View>

          {/* EXAM CATEGORY SECTION */}
          <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>
            Choose Your Exam
          </Text>

          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("ExamHomeScreen", { exam: "UPSC" })}
            >
              <Ionicons name="school-outline" size={26} color={COLORS.accent} />
              <Text style={[styles.quickText, { color: COLORS.text }]}>UPSC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("ExamHomeScreen", { exam: "NDA" })}
            >
              <FontAwesome5 name="fighter-jet" size={24} color={COLORS.accent} />
              <Text style={[styles.quickText, { color: COLORS.text }]}>NDA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("ExamHomeScreen", { exam: "SSC" })}
            >
              <MaterialIcons name="account-balance" size={26} color={COLORS.accent} />
              <Text style={[styles.quickText, { color: COLORS.text }]}>SSC</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("ExamHomeScreen", { exam: "Banking" })}
            >
              <Ionicons name="cash-outline" size={26} color={COLORS.accent} />
              <Text style={[styles.quickText, { color: COLORS.text }]}>Banking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("ExamHomeScreen", { exam: "Railway" })}
            >
              <FontAwesome5 name="train" size={24} color={COLORS.accent} />
              <Text style={[styles.quickText, { color: COLORS.text }]}>Railway</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: COLORS.card }]}
              onPress={() => navigation.navigate("ExamHomeScreen", { exam: "StatePSC" })}
            >
              <Entypo name="network" size={26} color={COLORS.accent} />
              <Text style={[styles.quickText, { color: COLORS.text }]}>State PSC</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />

        </ScrollView>
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

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 20,
    marginLeft: 16,
  },

  tipCard: {
    borderRadius: 16,
    margin: 16,
    padding: 16,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  tipTitle: { fontWeight: "700", fontSize: 15 },
  tipText: { marginTop: 4, lineHeight: 20 },

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
});
