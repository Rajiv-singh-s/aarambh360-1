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
  const [leaderboardData, setLeaderboardData] = useState<DailyChallengeLeaderboardEntryDto[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

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

  useEffect(() => {
    if (activeTab === "LEADERBOARD") {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const data = await apiGet<DailyChallengeDto[]>("/daily-challenges/active");
      setChallenges(data || []);
    } catch (error) {
      console.error("Failed to fetch challenges", error);
      // Fallback dummy data if backend not ready
      setChallenges([
        { id: "dc1", date: new Date().toISOString().split('T')[0], paperType: "PRELIMS_1", timeLimitMinutes: 25, totalQuestions: 20, isActive: true },
        { id: "dc2", date: new Date().toISOString().split('T')[0], paperType: "PRELIMS_2", timeLimitMinutes: 25, totalQuestions: 20, isActive: true },
        { id: "dc3", date: new Date().toISOString().split('T')[0], paperType: "MAINS", timeLimitMinutes: 20, totalQuestions: 1, isActive: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLbLoading(true);
      const data = await apiGet<DailyChallengeLeaderboardResponseDto>("/daily-challenges/leaderboard?period=DAILY");
      if (data && data.entries) {
        setLeaderboardData(data.entries);
      } else {
        throw new Error("No data");
      }
    } catch (error) {
      // Dummy leaderboard fallback
      setLeaderboardData([
        { userId: "1", name: "Aarav S.", rank: 1, score: 95, accuracy: 100, timeTakenSeconds: 300, avatarUrl: "https://i.pravatar.cc/150?u=a", isCurrentUser: false },
        { userId: "2", name: "Isha P.", rank: 2, score: 90, accuracy: 95, timeTakenSeconds: 350, avatarUrl: "https://i.pravatar.cc/150?u=b", isCurrentUser: false },
        { userId: "3", name: "You", rank: 3, score: 85, accuracy: 90, timeTakenSeconds: 400, avatarUrl: null, isCurrentUser: true },
        { userId: "4", name: "Rohan G.", rank: 4, score: 80, accuracy: 85, timeTakenSeconds: 450, avatarUrl: "https://i.pravatar.cc/150?u=c", isCurrentUser: false },
      ]);
    } finally {
      setLbLoading(false);
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

  const PodiumAvatar = ({ user, rank }: { user: DailyChallengeLeaderboardEntryDto; rank: number }) => {
    const isFirst = rank === 1;
    const size = isFirst ? 80 : 60;
    const color = isFirst ? "#fbbf24" : rank === 2 ? "#94a3b8" : "#b45309";

    return (
      <View style={[styles.podiumItem, isFirst && { zIndex: 10, transform: [{ translateY: -20 }] }]}>
        <View style={[styles.avatarRing, { borderColor: color, padding: isFirst ? 4 : 2 }]}>
          <Image 
            source={{ uri: user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}` }} 
            style={{ width: size, height: size, borderRadius: size / 2 }} 
          />
          <View style={[styles.rankBadge, { backgroundColor: color }]}>
            <Text style={styles.rankBadgeText}>{rank}</Text>
          </View>
        </View>
        <Text style={[styles.podiumName, { color: COLORS.text }]} numberOfLines={1}>
          {user.name.split(" ")[0]}
        </Text>
        <Text style={[styles.podiumScore, { color: color }]}>{user.score} pts</Text>
      </View>
    );
  };

  const renderLeaderboardItem = ({ item }: { item: DailyChallengeLeaderboardEntryDto }) => (
    <View
      style={[
        styles.listItem,
        { backgroundColor: item.isCurrentUser ? "rgba(245,158,11,0.15)" : COLORS.cardBg, borderColor: item.isCurrentUser ? "#f59e0b" : COLORS.border },
      ]}
    >
      <Text style={[styles.listRank, { color: COLORS.text }]}>{item.rank}</Text>
      <Image source={{ uri: item.avatarUrl || `https://ui-avatars.com/api/?name=${item.name}` }} style={styles.listAvatar} />
      <View style={styles.listInfo}>
        <Text style={[styles.listName, { color: COLORS.text, fontWeight: item.isCurrentUser ? "800" : "600" }]}>
          {item.name} {item.isCurrentUser && "(You)"}
        </Text>
        <Text style={[styles.listAcc, { color: COLORS.sub }]}>{item.accuracy}% Acc</Text>
      </View>
      <Text style={[styles.listScore, { color: COLORS.text }]}>{item.score} pts</Text>
    </View>
  );

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
            {(["PRELIMS_1", "PRELIMS_2", "MAINS", "LEADERBOARD"] as TabType[]).map((tab) => (
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
                  {tab === "PRELIMS_1" ? "Prelims 1" : tab === "PRELIMS_2" ? "Prelims 2" : tab === "MAINS" ? "Mains" : "Leaderboard"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {activeTab === "LEADERBOARD" ? (
          lbLoading ? (
            <ActivityIndicator style={{ marginTop: 50 }} size="large" color={COLORS.accent} />
          ) : (
            <FlatList
              data={leaderboardData.slice(3)}
              keyExtractor={(item) => item.userId}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                leaderboardData.length >= 3 ? (
                  <View style={styles.podiumContainer}>
                    <PodiumAvatar user={leaderboardData[1]} rank={2} />
                    <PodiumAvatar user={leaderboardData[0]} rank={1} />
                    <PodiumAvatar user={leaderboardData[2]} rank={3} />
                  </View>
                ) : null
              }
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
              renderItem={renderLeaderboardItem}
            />
          )
        ) : (
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
        )}
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
