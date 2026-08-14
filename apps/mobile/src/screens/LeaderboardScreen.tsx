import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";

const DUMMY_LEADERBOARD = [
  { id: "1", rank: 1, name: "Aarav Sharma", score: 198, accuracy: 98, avatar: "https://i.pravatar.cc/150?u=aarav" },
  { id: "2", rank: 2, name: "Isha Patel", score: 192, accuracy: 95, avatar: "https://i.pravatar.cc/150?u=isha" },
  { id: "3", rank: 3, name: "Rohan Gupta", score: 188, accuracy: 92, avatar: "https://i.pravatar.cc/150?u=rohan" },
  { id: "4", rank: 4, name: "Kavya Singh", score: 180, accuracy: 90, avatar: "https://i.pravatar.cc/150?u=kavya" },
  { id: "5", rank: 5, name: "Ananya Desai", score: 175, accuracy: 88, avatar: "https://i.pravatar.cc/150?u=ananya" },
  { id: "6", rank: 6, name: "Vikram Mehta", score: 170, accuracy: 85, avatar: "https://i.pravatar.cc/150?u=vikram" },
  { id: "7", rank: 7, name: "Priya Nair", score: 165, accuracy: 82, avatar: "https://i.pravatar.cc/150?u=priya" },
  { id: "8", rank: 8, name: "Rajiv Singh", score: 160, accuracy: 80, avatar: "https://i.pravatar.cc/150?u=rajiv", isCurrentUser: true },
  { id: "9", rank: 9, name: "Neha Joshi", score: 155, accuracy: 78, avatar: "https://i.pravatar.cc/150?u=neha" },
  { id: "10", rank: 10, name: "Aditya Kumar", score: 150, accuracy: 75, avatar: "https://i.pravatar.cc/150?u=aditya" },
];

export default function LeaderboardScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f0ff", "#ffffff"] as [string, string]),
    cardBg: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
  };

  const top3 = DUMMY_LEADERBOARD.slice(0, 3);
  const rest = DUMMY_LEADERBOARD.slice(3);
  const currentUser = DUMMY_LEADERBOARD.find((u) => u.isCurrentUser);

  const PodiumAvatar = ({ user, rank }: { user: typeof top3[0]; rank: number }) => {
    const isFirst = rank === 1;
    const size = isFirst ? 80 : 60;
    const color = isFirst ? "#fbbf24" : rank === 2 ? "#94a3b8" : "#b45309";

    return (
      <View style={[styles.podiumItem, isFirst && { zIndex: 10, transform: [{ translateY: -20 }] }]}>
        <View style={[styles.avatarRing, { borderColor: color, padding: isFirst ? 4 : 2 }]}>
          <Image source={{ uri: user.avatar }} style={{ width: size, height: size, borderRadius: size / 2 }} />
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

  const renderItem = ({ item }: { item: typeof DUMMY_LEADERBOARD[0] }) => (
    <View
      style={[
        styles.listItem,
        { backgroundColor: item.isCurrentUser ? "rgba(6,182,212,0.15)" : COLORS.cardBg, borderColor: item.isCurrentUser ? "#06b6d4" : COLORS.border },
      ]}
    >
      <Text style={[styles.listRank, { color: COLORS.text }]}>{item.rank}</Text>
      <Image source={{ uri: item.avatar }} style={styles.listAvatar} />
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
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Weekly Leaderboard</Text>
          <View style={{ width: 44 }} />
        </View>

        <FlatList
          data={rest}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.podiumContainer}>
              <PodiumAvatar user={top3[1]} rank={2} />
              <PodiumAvatar user={top3[0]} rank={1} />
              <PodiumAvatar user={top3[2]} rank={3} />
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          renderItem={renderItem}
        />

        {/* Current User Sticky Banner */}
        {currentUser && (
          <View style={[styles.stickyBanner, { backgroundColor: isDark ? "#0f172a" : "#ffffff", borderTopColor: COLORS.border }]}>
            <Text style={[styles.listRank, { color: COLORS.text }]}>{currentUser.rank}</Text>
            <Image source={{ uri: currentUser.avatar }} style={styles.listAvatar} />
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
});
