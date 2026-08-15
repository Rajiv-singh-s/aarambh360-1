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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import SafeContainer from "../components/SafeContainer";
import { apiPost } from "../services/apiClient";
import ConfettiCannon from "react-native-confetti-cannon";
import type {
  DailyChallengePaperType,
  SubmitDailyChallengeRequestDto,
} from "@aarambh360/types";

export default function ActiveDailyChallengeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isDark = useColorScheme() === "dark";

  const { challengeId, paperType, timeLimitMinutes } = route.params || {
    challengeId: "mock",
    paperType: "PRELIMS_1" as DailyChallengePaperType,
    timeLimitMinutes: 25,
  };

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(timeLimitMinutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // For prelims
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // For mains
  const [mainsAnswer, setMainsAnswer] = useState("");

  const confettiRef = useRef<any>(null);

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f3ff", "#ffffff"] as [string, string]),
    card: isDark ? "#1e293b" : "#ffffff",
    accent: isDark ? "#10b981" : "#059669",
    text: isDark ? "#fff" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
  };

  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleTimeUp = () => {
    Alert.alert("Time's Up!", "Your challenge time has expired. Submitting your current answers.");
    submitChallenge();
  };

  const submitChallenge = async () => {
    setSubmitting(true);
    try {
      const payload: SubmitDailyChallengeRequestDto = {
        challengeId,
        paperType,
        consumedTimeSeconds: timeLimitMinutes * 60 - timeLeftSeconds,
      };

      if (paperType === "MAINS") {
        payload.mainsAnswerText = mainsAnswer;
      } else {
        // dummy payload for prelims
        payload.answers = [{ questionId: "q1", selectedOptionId: selectedOption || "" }];
      }

      await apiPost("/daily-challenges/submit", payload);
    } catch (error) {
      console.warn("Submission error fallback for dummy", error);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      if (confettiRef.current) {
        confettiRef.current.start();
      }
      setTimeout(() => {
        navigation.navigate("DailyChallengeHubScreen");
      }, 4000);
    }
  };

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }} disableBottom={true}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={submitting || submitted}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Daily Challenge</Text>
          <View style={[styles.timerBox, { backgroundColor: timeLeftSeconds < 300 ? "#fee2e2" : COLORS.card }]}>
            <Ionicons name="time-outline" size={16} color={timeLeftSeconds < 300 ? "#ef4444" : COLORS.text} />
            <Text style={[styles.timerText, { color: timeLeftSeconds < 300 ? "#ef4444" : COLORS.text }]}>
              {formatTime(timeLeftSeconds)}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {paperType === "MAINS" ? (
            <View style={[styles.card, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
              <Text style={[styles.questionText, { color: COLORS.text }]}>
                Q1. Discuss the impact of climate change on Indian agriculture. Suggest measures to mitigate its adverse effects. (250 words)
              </Text>
              
              <View style={[styles.textAreaContainer, { borderColor: COLORS.border, backgroundColor: isDark ? "#0f172a" : "#f8fafc" }]}>
                <Text style={{ color: COLORS.sub, marginVertical: 40, textAlign: "center" }}>
                  Mains Answer Editor (Integration goes here)
                </Text>
              </View>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
              <Text style={[styles.questionText, { color: COLORS.text }]}>
                Q1. Which of the following is correct regarding the Monetary Policy Committee (MPC) in India?
              </Text>
              
              {["It is a 6-member body.", "It is chaired by the Finance Minister.", "It meets at least 6 times a year.", "Both A and C."].map((opt, i) => {
                const isSelected = selectedOption === String(i);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.optionBtn,
                      { borderColor: isSelected ? COLORS.accent : COLORS.border },
                      isSelected && { backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "#dcfce3" }
                    ]}
                    onPress={() => setSelectedOption(String(i))}
                    disabled={submitted}
                  >
                    <View style={[styles.radio, { borderColor: isSelected ? COLORS.accent : COLORS.sub }]}>
                      {isSelected && <View style={[styles.radioDot, { backgroundColor: COLORS.accent }]} />}
                    </View>
                    <Text style={[styles.optionText, { color: COLORS.text }]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: COLORS.card, borderTopColor: COLORS.border }]}>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: COLORS.accent, opacity: submitted ? 0.7 : 1 }]}
            onPress={submitChallenge}
            disabled={submitting || submitted}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>{submitted ? "Submitted Successfully!" : "Submit Challenge"}</Text>
            )}
          </TouchableOpacity>
        </View>

        {submitted && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <ConfettiCannon
              ref={confettiRef}
              count={200}
              origin={{ x: -10, y: 0 }}
              autoStart={false}
              fadeOut={true}
            />
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    justifyContent: "space-between",
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(150,150,150,0.2)",
  },
  timerText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "900",
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 26,
    marginBottom: 20,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 15,
    flex: 1,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 200,
    justifyContent: "center",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 2,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});
