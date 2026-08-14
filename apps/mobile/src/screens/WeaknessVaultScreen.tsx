import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const INITIAL_MISTAKES = [
  {
    id: "m1",
    tag: "Economy",
    question: "Which of the following is NOT included in the calculation of Gross Domestic Product (GDP)?",
    wrongAnswer: "Exports minus Imports",
    correctAnswer: "Transfer payments (like pensions)",
    explanation: "Transfer payments are not included in GDP because they do not represent production of goods and services.",
  },
  {
    id: "m2",
    tag: "Polity",
    question: "The power to increase the number of judges in the Supreme Court of India is vested in:",
    wrongAnswer: "The President of India",
    correctAnswer: "The Parliament",
    explanation: "Article 124 of the Constitution authorizes the Parliament to increase the number of judges in the Supreme Court.",
  },
  {
    id: "m3",
    tag: "History",
    question: "The 'Swadeshi' and 'Boycott' were adopted as methods of struggle for the first time during the:",
    wrongAnswer: "Non-Cooperation Movement",
    correctAnswer: "Agitation against the Partition of Bengal",
    explanation: "The Swadeshi Movement started with the partition of Bengal by the Viceroy of India, Lord Curzon, in 1905.",
  },
];

export default function WeaknessVaultScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";

  const [mistakes, setMistakes] = useState(INITIAL_MISTAKES);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f0ff", "#ffffff"] as [string, string]),
    cardBg: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    accent: "#ef4444", // Red for mistakes
    success: "#10b981",
  };

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    try {
      const saved = await AsyncStorage.getItem("weaknessVault");
      if (saved) {
        setMistakes(JSON.parse(saved));
      } else {
        // First time load
        await AsyncStorage.setItem("weaknessVault", JSON.stringify(INITIAL_MISTAKES));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAsMastered = async (id: string) => {
    const updated = mistakes.filter((m) => m.id !== id);
    setMistakes(updated);
    try {
      await AsyncStorage.setItem("weaknessVault", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMasterPress = (id: string) => {
    Alert.alert("Mark as Mastered?", "Are you sure you have learned this concept? It will be removed from your vault.", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes, Remove", style: "destructive", onPress: () => markAsMastered(id) },
    ]);
  };

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Weakness Vault</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBadge, { backgroundColor: COLORS.accent + "15" }]}>
            <Text style={[styles.statNum, { color: COLORS.accent }]}>{mistakes.length}</Text>
            <Text style={[styles.statLabel, { color: COLORS.accent }]}>To Review</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {mistakes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
              <Text style={[styles.emptyText, { color: COLORS.text }]}>Vault is Empty!</Text>
              <Text style={[styles.emptySub, { color: COLORS.sub }]}>You have mastered all your mistakes. Keep taking quizzes to find more weak spots.</Text>
            </View>
          ) : (
            mistakes.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <View key={item.id} style={[styles.mistakeCard, { backgroundColor: COLORS.cardBg, borderColor: isExpanded ? COLORS.accent : COLORS.border }]}>
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.tagText, { color: COLORS.accent }]}>{item.tag}</Text>
                      <Text style={[styles.questionText, { color: COLORS.text }]}>{item.question}</Text>
                    </View>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={COLORS.sub} style={{ marginLeft: 10 }} />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[styles.cardBody, { borderTopColor: COLORS.border }]}>
                      <View style={styles.answerRow}>
                        <Ionicons name="close-circle" size={18} color="#ef4444" />
                        <Text style={[styles.wrongAnswerText, { color: "#ef4444" }]}>You answered: {item.wrongAnswer}</Text>
                      </View>
                      <View style={styles.answerRow}>
                        <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                        <Text style={[styles.correctAnswerText, { color: "#10b981" }]}>Correct: {item.correctAnswer}</Text>
                      </View>

                      <View style={[styles.explanationBox, { backgroundColor: "rgba(150,150,150,0.1)" }]}>
                        <Text style={[styles.explanationText, { color: COLORS.text }]}>{item.explanation}</Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.masterBtn, { backgroundColor: COLORS.success }]}
                        onPress={() => handleMasterPress(item.id)}
                      >
                        <Ionicons name="school" size={18} color="#fff" />
                        <Text style={styles.masterBtnText}>Mark as Mastered</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
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
  statsRow: {
    alignItems: "center",
    marginBottom: 20,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statNum: {
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySub: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  mistakeCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  cardBody: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    marginTop: 8,
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    paddingRight: 20,
  },
  wrongAnswerText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    lineHeight: 20,
  },
  correctAnswerText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
    lineHeight: 20,
  },
  explanationBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 22,
  },
  masterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  masterBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
