import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";
import { apiGet } from "../services/apiClient";
import type { DailyChallengeLeaderboardResponseDto, DailyChallengeLeaderboardEntryDto, DailyChallengePaperType } from "@aarambh360/types";

export default function LeaderboardScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";

  const [activePeriod, setActivePeriod] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");
  const [activePaper, setActivePaper] = useState<DailyChallengePaperType>("PRELIMS_1");
  const [leaderboard, setLeaderboard] = useState<DailyChallengeLeaderboardEntryDto[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f0ff", "#ffffff"] as [string, string]),
    cardBg: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    accent: isDark ? "#06b6d4" : "#0891b2",
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activePeriod, activePaper]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await apiGet<DailyChallengeLeaderboardResponseDto>(`/daily-challenges/leaderboard?period=${activePeriod}&paperType=${activePaper}`);
      if (data && data.entries) {
        setLeaderboard(data.entries);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const currentUser = leaderboard.find((u) => u.isCurrentUser);

  const PodiumAvatar = ({ user, rank }: { user: DailyChallengeLeaderboardEntryDto | undefined; rank: number }) => {
    if (!user) return <View style={[styles.podiumItem, rank === 1 && { transform: [{ translateY: -20 }] }]} />;
    const isFirst = rank === 1;
    const size = isFirst ? 80 : 60;
    const color = isFirst ? "#fbbf24" : rank === 2 ? "#94a3b8" : "#b45309";

    return (
      <View style={[styles.podiumItem, isFirst && { zIndex: 10, transform: [{ translateY: -20 }] }]}>
        <View style={[styles.avatarRing, { borderColor: color, padding: isFirst ? 4 : 2 }]}>
          <Image source={{ uri: user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}` }} style={{ width: size, height: size, borderRadius: size / 2 }} />
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

  const renderItem = ({ item }: { item: DailyChallengeLeaderboardEntryDto }) => (
    <View
      style={[
        styles.listItem,
        { backgroundColor: item.isCurrentUser ? "rgba(6,182,212,0.15)" : COLORS.cardBg, borderColor: item.isCurrentUser ? "#06b6d4" : COLORS.border },
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Leaderboards</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.toggleRow}>
            {(["DAILY", "WEEKLY", "MONTHLY"] as const).map(p => (
              <TouchableOpacity key={p} style={[styles.filterBtn, activePeriod === p && { backgroundColor: COLORS.accent }]} onPress={() => setActivePeriod(p)}>
                <Text style={[styles.filterText, activePeriod === p && { color: "#fff" }]}>{p === "DAILY" ? "Daily" : p === "WEEKLY" ? "Weekly" : "Monthly"}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.toggleRow}>
            {(["PRELIMS_1", "PRELIMS_2", "MAINS"] as const).map(p => (
              <TouchableOpacity key={p} style={[styles.filterBtn, activePaper === p && { backgroundColor: COLORS.accent }]} onPress={() => setActivePaper(p)}>
                <Text style={[styles.filterText, activePaper === p && { color: "#fff" }]}>{p === "PRELIMS_1" ? "Prelims 1" : p === "PRELIMS_2" ? "Prelims 2" : "Mains"}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 50 }} />
        ) : leaderboard.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Ionicons name="trophy-outline" size={64} color={COLORS.sub} />
            <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "600", marginTop: 16 }}>No rankings yet!</Text>
          </View>
        ) : (
          <FlatList
            data={rest}
            keyExtractor={(item) => item.userId}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              top3.length > 0 ? (
                <View style={styles.podiumContainer}>
                  <PodiumAvatar user={top3[1]} rank={2} />
                  <PodiumAvatar user={top3[0]} rank={1} />
                  <PodiumAvatar user={top3[2]} rank={3} />
                </View>
              ) : null
            }
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            renderItem={renderItem}
          />
        )}
        {/* Current User Sticky Banner */}
        {currentUser && (
          <View style={[styles.stickyBanner, { backgroundColor: isDark ? "#0f172a" : "#ffffff", borderTopColor: COLORS.border }]}>
            <Text style={[styles.listRank, { color: COLORS.text }]}>{currentUser.rank}</Text>
            <Image source={{ uri: currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.name}` }} style={styles.listAvatar} />
            <View style={styles.listInfo}>
              <Text style={[styles.listName, { color: COLORS.text, fontWeight: "800" }]}>
                {currentUser.name} (You)
              </Text>
              <Text style={[styles.listAcc, { color: COLORS.sub }]}>{currentUser.accuracy}% Acc</Text>
            </View>
            <Text style={[styles.listScore, { color: COLORS.text }]}>{currentUser.score} pts</Text>
          </View>
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
    paddingBottom: 20,
  },
  backBtn: { padding: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
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
  stickyBanner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "rgba(150,150,150,0.1)",
    borderRadius: 8,
    padding: 4,
    marginBottom: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  }
});
