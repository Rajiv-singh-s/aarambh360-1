import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";

const DUMMY_TESTS = [
  {
    id: "1",
    title: "Aarambh360 Full Length Test 1",
    type: "Full Length",
    questions: 100,
    marks: 200,
    time: 120, // mins
    status: "New",
  },
  {
    id: "2",
    title: "Sectional Mock: Indian Polity",
    type: "Sectional",
    questions: 50,
    marks: 100,
    time: 60,
    status: "Attempted",
  },
  {
    id: "3",
    title: "CSAT Full Length Mock 1",
    type: "CSAT",
    questions: 80,
    marks: 200,
    time: 120,
    status: "New",
  },
  {
    id: "4",
    title: "UPSC CSE Prelims 2023 (GS1)",
    type: "PYQ",
    questions: 100,
    marks: 200,
    time: 120,
    status: "New",
  },
];

const TABS = ["All", "Full Length", "Sectional", "CSAT", "PYQ"];

export default function TestSeriesHubScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";
  const [activeTab, setActiveTab] = useState("All");

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f0ff", "#ffffff"] as [string, string]),
    cardBg: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    accent: "#06b6d4",
  };

  const filteredTests =
    activeTab === "All"
      ? DUMMY_TESTS
      : DUMMY_TESTS.filter((t) => t.type === activeTab);

  const renderTestCard = ({ item }: { item: typeof DUMMY_TESTS[0] }) => (
    <View style={[styles.testCard, { backgroundColor: COLORS.cardBg, borderColor: COLORS.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: COLORS.accent + "20" }]}>
            <Text style={[styles.typeText, { color: COLORS.accent }]}>{item.type}</Text>
          </View>
          {item.status === "New" && (
            <View style={[styles.typeBadge, { backgroundColor: "#10b98120" }]}>
              <Text style={[styles.typeText, { color: "#10b981" }]}>New</Text>
            </View>
          )}
        </View>
        <Ionicons name="ellipsis-vertical" size={20} color={COLORS.sub} />
      </View>

      <Text style={[styles.testTitle, { color: COLORS.text }]}>{item.title}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Ionicons name="list" size={16} color={COLORS.sub} />
          <Text style={[styles.statText, { color: COLORS.sub }]}>{item.questions} Qs</Text>
        </View>
        <View style={styles.statBox}>
          <FontAwesome5 name="medal" size={14} color={COLORS.sub} />
          <Text style={[styles.statText, { color: COLORS.sub }]}>{item.marks} Marks</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="time-outline" size={16} color={COLORS.sub} />
          <Text style={[styles.statText, { color: COLORS.sub }]}>{item.time} Mins</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: item.status === "Attempted" ? "transparent" : COLORS.accent, borderColor: COLORS.accent, borderWidth: 1 }]}
        onPress={() => navigation.navigate("ActiveMockTestScreen")}
      >
        <Text style={[styles.startBtnText, { color: item.status === "Attempted" ? COLORS.accent : "#fff" }]}>
          {item.status === "Attempted" ? "Review Result" : "Attempt Now"}
        </Text>
      </TouchableOpacity>
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
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Test Series</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Tabs */}
        <View style={{ paddingVertical: 10 }}>
          <FlatList
            data={TABS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === item ? { backgroundColor: COLORS.accent } : { backgroundColor: COLORS.cardBg, borderColor: COLORS.border, borderWidth: 1 },
                ]}
                onPress={() => setActiveTab(item)}
              >
                <Text style={[styles.tabText, activeTab === item ? { color: "#fff" } : { color: COLORS.text }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(i) => i}
          />
        </View>

        {/* Tests List */}
        <FlatList
          data={filteredTests}
          keyExtractor={(item) => item.id}
          renderItem={renderTestCard}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
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
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
  },
  testCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  testTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: "600",
  },
  startBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: "800",
  },
});
