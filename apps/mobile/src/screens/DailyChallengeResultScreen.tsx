import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";

export default function DailyChallengeResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isDark = useColorScheme() === "dark";

  const { result, paperType } = route.params || {};

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f3ff", "#ffffff"] as [string, string]),
    card: isDark ? "#1e293b" : "#ffffff",
    accent: isDark ? "#10b981" : "#059669",
    text: isDark ? "#fff" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
  };

  const score = result?.score || 0;
  let message = "Good effort!";
  if (score > 40) message = "Outstanding Performance! 🏆";
  else if (score > 25) message = "Great Job! Keep it up. 🚀";

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }} disableBottom={true}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("ExamHomeScreen")} style={styles.backBtn}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Ionicons name="trophy" size={100} color="#fbbf24" style={{ marginBottom: 20 }} />
          
          <Text style={[styles.title, { color: COLORS.text }]}>Challenge Complete!</Text>
          <Text style={[styles.message, { color: COLORS.sub }]}>{message}</Text>

          {paperType !== "MAINS" ? (
            <View style={[styles.statsContainer, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: COLORS.text }]}>{score.toFixed(2)}</Text>
                <Text style={[styles.statLabel, { color: COLORS.sub }]}>Score</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: COLORS.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: COLORS.text }]}>{result?.accuracy || 0}%</Text>
                <Text style={[styles.statLabel, { color: COLORS.sub }]}>Accuracy</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: COLORS.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: COLORS.text }]}>{result?.consumedTimeSeconds ? Math.floor(result.consumedTimeSeconds / 60) : 0}m</Text>
                <Text style={[styles.statLabel, { color: COLORS.sub }]}>Time Taken</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.statsContainer, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
              <Text style={{ color: COLORS.text, textAlign: "center", padding: 20 }}>
                Your Mains answer has been submitted for AI evaluation. You will be notified once graded!
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: COLORS.accent }]}
            onPress={() => navigation.navigate("DailyChallengeHubScreen")}
          >
            <Text style={styles.btnText}>Back to Hub</Text>
          </TouchableOpacity>
        </View>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    padding: 16,
    alignItems: "flex-end",
  },
  backBtn: { padding: 4 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 40,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 40,
    width: "100%",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: "100%",
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  btn: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
