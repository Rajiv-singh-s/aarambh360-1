import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";

// Dummy data for 100 questions
const TOTAL_QUESTIONS = 100;
const DUMMY_QUESTION = {
  text: "With reference to the 'Finance Commission' of India, which of the following statements is/are correct?\n\n1. It encourages the inflow of foreign capital for infrastructure development.\n2. It facilitates the proper distribution of finances among the Public Sector Undertakings.\n3. It ensures transparency in financial administration.\n\nSelect the correct answer using the code given below:",
  options: ["1 only", "2 and 3 only", "1, 2 and 3", "None of the above"],
};

export default function ActiveMockTestScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";

  const [currentQ, setCurrentQ] = useState(1);
  const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 mins
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [isGridOpen, setIsGridOpen] = useState(false);

  const COLORS = {
    bg: isDark ? "#0f172a" : "#f8fafc",
    cardBg: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    accent: "#06b6d4",
    answered: "#10b981", // Green
    review: "#8b5cf6", // Purple
    unanswered: isDark ? "#334155" : "#e2e8f0", // Gray
  };

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (idx: number) => {
    setAnswers({ ...answers, [currentQ]: idx });
  };

  const handleSaveAndNext = () => {
    if (currentQ < TOTAL_QUESTIONS) setCurrentQ(currentQ + 1);
  };

  const handleMarkReview = () => {
    setMarkedForReview({ ...markedForReview, [currentQ]: !markedForReview[currentQ] });
  };

  const getStatusColor = (qNum: number) => {
    if (markedForReview[qNum]) return COLORS.review;
    if (answers[qNum] !== undefined) return COLORS.answered;
    if (currentQ === qNum) return COLORS.accent;
    return COLORS.unanswered;
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg }]}>
      <SafeContainer style={{ flex: 1 }} disableBottom={true}>
        {/* Top Header */}
        <View style={[styles.header, { borderBottomColor: COLORS.border, backgroundColor: COLORS.cardBg }]}>
          <Text style={[styles.testTitle, { color: COLORS.text }]} numberOfLines={1}>Aarambh360 FLT 1</Text>
          <View style={[styles.timerBox, { backgroundColor: timeLeft < 300 ? "#ef444420" : COLORS.accent + "20" }]}>
            <Ionicons name="time-outline" size={16} color={timeLeft < 300 ? "#ef4444" : COLORS.accent} />
            <Text style={[styles.timerText, { color: timeLeft < 300 ? "#ef4444" : COLORS.accent }]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        {/* Question Content */}
        <ScrollView style={styles.scrollArea} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <View style={styles.qHeader}>
            <Text style={[styles.qNumBadge, { backgroundColor: COLORS.accent }]}>Q.{currentQ}</Text>
            <View style={styles.markBadge}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.sub }}>+2.0 / -0.66</Text>
            </View>
          </View>

          <Text style={[styles.questionText, { color: COLORS.text }]}>{DUMMY_QUESTION.text}</Text>

          <View style={styles.optionsList}>
            {DUMMY_QUESTION.options.map((opt, idx) => {
              const isSelected = answers[currentQ] === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionCard,
                    { backgroundColor: COLORS.cardBg, borderColor: isSelected ? COLORS.accent : COLORS.border },
                    isSelected && { backgroundColor: COLORS.accent + "10" }
                  ]}
                  onPress={() => handleSelectOption(idx)}
                >
                  <View style={[styles.radio, { borderColor: isSelected ? COLORS.accent : COLORS.sub }]}>
                    {isSelected && <View style={[styles.radioDot, { backgroundColor: COLORS.accent }]} />}
                  </View>
                  <Text style={[styles.optionText, { color: COLORS.text, fontWeight: isSelected ? "700" : "500" }]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={[styles.bottomBar, { backgroundColor: COLORS.cardBg, borderTopColor: COLORS.border }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setIsGridOpen(true)}>
            <Ionicons name="grid" size={24} color={COLORS.sub} />
            <Text style={[styles.actionLabel, { color: COLORS.sub }]}>Grid</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionBtn} onPress={handleMarkReview}>
            <Ionicons name={markedForReview[currentQ] ? "bookmark" : "bookmark-outline"} size={24} color={COLORS.review} />
            <Text style={[styles.actionLabel, { color: COLORS.review }]}>Review</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.accent }]} onPress={handleSaveAndNext}>
            <Text style={styles.saveBtnText}>Save & Next</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Grid Overlay Modal */}
        <Modal visible={isGridOpen} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.bottomSheet, { backgroundColor: COLORS.bg }]}>
              <View style={[styles.sheetHeader, { borderBottomColor: COLORS.border }]}>
                <Text style={[styles.sheetTitle, { color: COLORS.text }]}>Question Palette</Text>
                <TouchableOpacity onPress={() => setIsGridOpen(false)} style={{ padding: 8 }}>
                  <Ionicons name="close" size={28} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              {/* Legend */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.answered }]} /><Text style={{ color: COLORS.sub, fontSize: 10 }}>Answered</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.review }]} /><Text style={{ color: COLORS.sub, fontSize: 10 }}>Review</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.unanswered }]} /><Text style={{ color: COLORS.sub, fontSize: 10 }}>Unanswered</Text></View>
              </View>

              <FlatList
                data={Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1)}
                numColumns={5}
                keyExtractor={(item) => item.toString()}
                contentContainerStyle={{ padding: 16 }}
                columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.gridItem,
                      { backgroundColor: getStatusColor(item) },
                      currentQ === item && { borderWidth: 2, borderColor: COLORS.text }
                    ]}
                    onPress={() => {
                      setCurrentQ(item);
                      setIsGridOpen(false);
                    }}
                  >
                    <Text style={[styles.gridText, { color: item === currentQ ? COLORS.bg : "#fff" }]}>{item}</Text>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity style={[styles.submitTestBtn, { backgroundColor: "#ef4444" }]} onPress={() => { setIsGridOpen(false); navigation.goBack(); }}>
                <Text style={styles.submitTestText}>Submit Full Test</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
    marginRight: 10,
  },
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  scrollArea: { flex: 1 },
  qHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  qNumBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
    overflow: "hidden",
  },
  markBadge: {
    backgroundColor: "rgba(150,150,150,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "600",
    marginBottom: 24,
  },
  optionsList: { gap: 12 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    height: "80%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "rgba(150,150,150,0.05)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  gridItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  gridText: {
    fontSize: 16,
    fontWeight: "800",
  },
  submitTestBtn: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitTestText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
