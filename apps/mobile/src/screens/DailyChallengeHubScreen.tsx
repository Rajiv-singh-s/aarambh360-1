import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import SafeContainer from "../components/SafeContainer";
import { apiGet } from "../services/apiClient";
import type {
  DailyChallengeDto,
  DailyChallengeLeaderboardResponseDto,
  DailyChallengeLeaderboardEntryDto,
} from "@aarambh360/types";

type TabType = "PRELIMS_1" | "PRELIMS_2" | "MAINS" | "LEADERBOARD";

export default function DailyChallengeHubScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";
  const [activeTab, setActiveTab] = useState<TabType>("PRELIMS_1");

  const [challenges, setChallenges] = useState<DailyChallengeDto[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f3ff", "#ffffff"] as [string, string]),
    card: isDark ? "#1e293b" : "#ffffff",
    cardBg: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    accent: isDark ? "#f59e0b" : "#d97706",
    text: isDark ? "#fff" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const data = await apiGet<DailyChallengeDto[]>("/daily-challenges/today");
      setChallenges(data || []);
    } catch (error) {
      console.error("Failed to fetch challenges", error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const currentChallenge = challenges.find((c) => c.paperType === activeTab);

  const startChallenge = () => {
    if (currentChallenge) {
      navigation.navigate("ActiveDailyChallengeScreen", {
        challengeId: currentChallenge.id,
        paperType: currentChallenge.paperType,
        timeLimitMinutes: currentChallenge.timeLimitMinutes,
      });
    }
  };

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }} disableBottom={true}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Daily Challenge</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {(["PRELIMS_1", "PRELIMS_2", "MAINS"] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabBtn,
                  activeTab === tab && { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
                  { borderColor: COLORS.border }
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, { color: activeTab === tab ? "#fff" : COLORS.sub }]}>
                  {tab === "PRELIMS_1" ? "Prelims 1" : tab === "PRELIMS_2" ? "Prelims 2" : "Mains"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.accent} />
          ) : currentChallenge ? (
            <View style={[styles.challengeCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
              <Ionicons name={activeTab === "MAINS" ? "create" : "document-text"} size={48} color={COLORS.accent} />
              <Text style={[styles.challengeTitle, { color: COLORS.text }]}>
                Today's {activeTab === "PRELIMS_1" ? "Prelims 1" : activeTab === "PRELIMS_2" ? "Prelims 2" : "Mains"} Challenge
              </Text>
              <Text style={[styles.challengeDesc, { color: COLORS.sub }]}>
                {currentChallenge.totalQuestions} Questions • {currentChallenge.timeLimitMinutes} Minutes
              </Text>
              
              <TouchableOpacity style={[styles.startBtn, { backgroundColor: COLORS.accent }]} onPress={startChallenge}>
                <Text style={styles.startBtnText}>Start Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.challengeCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
              <Ionicons name="checkmark-done-circle" size={48} color="#10b981" />
              <Text style={[styles.challengeTitle, { color: COLORS.text }]}>All Caught Up!</Text>
              <Text style={[styles.challengeDesc, { color: COLORS.sub }]}>
                No active challenge for this section right now. Come back later.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backBtn: { padding: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
  },
  tabsContainer: {
    height: 50,
    marginBottom: 10,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
  },
  challengeCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 16,
    textAlign: "center",
  },
  challengeDesc: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 24,
  },
  startBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  startBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingVertical: 30,
    paddingBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.2)",
    marginBottom: 16,
  },
  podiumItem: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  avatarRing: {
    borderWidth: 3,
    borderRadius: 50,
    marginBottom: 8,
  },
  rankBadge: {
    position: "absolute",
    bottom: -10,
    alignSelf: "center",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  rankBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  podiumName: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  podiumScore: {
    fontSize: 12,
    fontWeight: "800",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  listRank: {
    width: 30,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 15,
  },
  listAcc: {
    fontSize: 12,
    marginTop: 2,
  },
  listScore: {
    fontSize: 16,
    fontWeight: "800",
  },
});
