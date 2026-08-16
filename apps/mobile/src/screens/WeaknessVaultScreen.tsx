import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";
import { useProgress } from "../hooks/useProgress";

const DangerBadge = ({ count, color }: { count: number; color: string }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.05, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [scale, opacity]);

  if (count <= 1) return null;

  return (
    <Animated.View style={[styles.dangerBadge, { backgroundColor: color + "20", borderColor: color, transform: [{ scale }], opacity }]}>
      <Ionicons name="flame" size={14} color={color} />
      <Text style={[styles.dangerText, { color }]}>{count}x Wrong</Text>
    </Animated.View>
  );
};

export default function WeaknessVaultScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";

  const { mistakes: rawMistakes, loading } = useProgress();
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (rawMistakes) {
      setMistakes(rawMistakes);
    }
  }, [rawMistakes]);

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f0ff", "#ffffff"] as [string, string]),
    cardBg: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    accent: "#ef4444", // Red for mistakes
    success: "#10b981",
  };

  const markAsMastered = (id: string) => {
    const updated = mistakes.filter((m) => m.id !== id);
    setMistakes(updated);
    // TODO: Connect to backend to mark mistake as resolved
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
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Mistake Vault</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBadge, { backgroundColor: COLORS.accent + "15" }]}>
            <Text style={[styles.statNum, { color: COLORS.accent }]}>{mistakes.length}</Text>
            <Text style={[styles.statLabel, { color: COLORS.accent }]}>To Review</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 60 }} />
          ) : mistakes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
              <Text style={[styles.emptyText, { color: COLORS.text }]}>Vault is Empty!</Text>
              <Text style={[styles.emptySub, { color: COLORS.sub }]}>You have mastered all your mistakes. Keep taking quizzes to find more weak spots.</Text>
            </View>
          ) : (
            mistakes.map((item) => {
              const isExpanded = expandedId === item.id;
              const options = item.options || [];

              return (
                <View key={item.id} style={[styles.mistakeCard, { backgroundColor: COLORS.cardBg, borderColor: isExpanded ? COLORS.accent : COLORS.border }]}>
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={styles.tagRow}>
                        <DangerBadge count={item.incorrectCount} color={COLORS.accent} />
                      </View>
                      <Text style={[styles.questionText, { color: COLORS.text }]}>{item.questionText}</Text>
                    </View>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={COLORS.sub} style={{ marginLeft: 10, marginTop: 4 }} />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[styles.cardBody, { borderTopColor: COLORS.border }]}>
                      
                      <Text style={[styles.optionsTitle, { color: COLORS.sub }]}>Options:</Text>
                      {options.map((opt: any, idx: number) => (
                        <View key={opt.id} style={[styles.optionRow, opt.isCorrect && { backgroundColor: COLORS.success + "15", borderColor: COLORS.success }]}>
                          <Text style={[styles.optionLabel, { color: opt.isCorrect ? COLORS.success : COLORS.sub }]}>
                            {String.fromCharCode(65 + idx)}.
                          </Text>
                          <Text style={[styles.optionText, { color: opt.isCorrect ? COLORS.success : COLORS.text, fontWeight: opt.isCorrect ? "700" : "500" }]}>
                            {opt.text}
                          </Text>
                          {opt.isCorrect && <Ionicons name="checkmark-circle" size={18} color={COLORS.success} style={{ marginLeft: "auto" }} />}
                        </View>
                      ))}

                      {item.explanation && (
                        <View style={[styles.explanationBox, { backgroundColor: "rgba(150,150,150,0.1)" }]}>
                          <Text style={[styles.explanationTitle, { color: COLORS.text }]}>Explanation:</Text>
                          <Text style={[styles.explanationText, { color: COLORS.text }]}>{item.explanation}</Text>
                        </View>
                      )}

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
  tagRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dangerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    alignSelf: "flex-start",
  },
  dangerText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
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
  optionsTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 8,
    backgroundColor: "rgba(150,150,150,0.05)",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "800",
    marginRight: 12,
  },
  optionText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  explanationBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
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
