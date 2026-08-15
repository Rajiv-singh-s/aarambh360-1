import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import SafeContainer from "../components/SafeContainer";
import { apiPost, apiGet } from "../services/apiClient";
import ConfettiCannon from "react-native-confetti-cannon";
import quizStyles from "./styles/QuizScreen.styles";
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
  
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // For prelims
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> selectedOptionId

  // For mains
  const [mainsAnswer, setMainsAnswer] = useState("");

  const confettiRef = useRef<any>(null);
  const progressScrollRef = useRef<ScrollView | null>(null);

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f3ff", "#ffffff"] as [string, string]),
    card: isDark ? "#1e293b" : "#ffffff",
    accent: isDark ? "#06b6d4" : "#0284c7",
    text: isDark ? "#fff" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    dotDefault: isDark ? "#334155" : "#cce4ff",
  };

  useEffect(() => {
    fetchChallenge();
  }, []);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const data = await apiGet<any[]>("/daily-challenges/today");
      const current = data?.find((c: any) => c.id === challengeId);
      if (current) setChallenge(current);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (submitted || loading || !challenge) return;

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
  }, [submitted, loading, challenge]);

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
        payload.answers = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        }));
      }

      const result = await apiPost("/daily-challenges/submit", payload);
      setSubmitted(true);
      if (confettiRef.current) {
        confettiRef.current.start();
      }
      setTimeout(() => {
        navigation.navigate("DailyChallengeResultScreen", { result, paperType });
      }, 3000);
    } catch (error) {
      console.error("Submission error", error);
      Alert.alert("Error", "Failed to submit challenge.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={COLORS.bg} style={quizStyles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </LinearGradient>
    );
  }

  if (!challenge) {
    return (
      <LinearGradient colors={COLORS.bg} style={quizStyles.center}>
        <Text style={{ color: COLORS.text }}>Challenge not found.</Text>
      </LinearGradient>
    );
  }

  const currentQ = paperType === "MAINS" ? challenge.mainsQuestion : challenge.questions?.[currentIndex];
  const totalQ = paperType === "MAINS" ? 1 : (challenge.questions?.length || 0);

  return (
    <LinearGradient colors={COLORS.bg} style={quizStyles.safe}>
      <SafeContainer style={{ flex: 1 }} disableBottom={true}>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {/* HEADER */}
          <View style={quizStyles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={submitting || submitted}>
              <Ionicons name="arrow-back" size={22} color={COLORS.accent} />
            </TouchableOpacity>

            <Text style={[quizStyles.headerTitle, { color: COLORS.text }]}>
              {paperType === "MAINS" ? "Mains Challenge" : "Prelims Challenge"}
            </Text>

            <View style={{ width: 22 }} />
          </View>

          {/* PROGRESS DOTS */}
          {paperType !== "MAINS" && (
            <ScrollView
              ref={progressScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={quizStyles.progressRow}
            >
              {Array.from({ length: totalQ }).map((_, i) => {
                const isSelected = currentIndex === i;
                const isAnswered = !!answers[challenge.questions?.[i]?.id];
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      setCurrentIndex(i);
                      progressScrollRef.current?.scrollTo({
                        x: i * 40,
                        animated: true,
                      });
                    }}
                  >
                    <View
                      style={[
                        quizStyles.progressDot,
                        {
                          backgroundColor: isAnswered ? COLORS.accent : COLORS.dotDefault,
                          borderColor: isSelected ? COLORS.text : "transparent",
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                    >
                      <Text style={[quizStyles.dotText, { color: isAnswered ? "#fff" : COLORS.text }]}>
                        {i + 1}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* TOP INFO CARD */}
          <View
            style={[
              quizStyles.topInfoCard,
              { backgroundColor: COLORS.card, borderColor: COLORS.accent + "22" },
            ]}
          >
            <View style={quizStyles.infoItem}>
              <Text style={[quizStyles.infoLabel, { color: COLORS.sub }]}>QUESTION</Text>
              <Text style={[quizStyles.infoValue, { color: COLORS.text }]}>
                {currentIndex + 1}/{totalQ}
              </Text>
            </View>

            <View style={quizStyles.infoItem}>
              <Text style={[quizStyles.infoLabel, { color: COLORS.sub }]}>TIME LEFT</Text>
              <Text style={[quizStyles.infoValue, { color: timeLeftSeconds < 300 ? "#ef4444" : COLORS.text }]}>
                {formatTime(timeLeftSeconds)}
              </Text>
            </View>
          </View>

          {/* QUESTION CARD */}
          <View style={[quizStyles.card, { backgroundColor: COLORS.card, borderColor: COLORS.accent + "22" }]}>
            {paperType === "MAINS" && currentQ ? (
              <>
                <Text style={[quizStyles.question, { color: COLORS.text }]}>
                  {currentQ.text}
                </Text>
                
                <View style={[styles.textAreaContainer, { borderColor: COLORS.accent + "55", backgroundColor: isDark ? "#0f172a" : "#f8fafc" }]}>
                  <Text style={{ color: COLORS.sub, marginVertical: 40, textAlign: "center" }}>
                    Mains Answer Editor Placeholder
                  </Text>
                </View>
              </>
            ) : currentQ ? (
              <>
                <Text style={[quizStyles.question, { color: COLORS.text }]}>
                  {currentQ.text}
                </Text>
                
                {currentQ.options?.map((opt: any, i: number) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        quizStyles.optionCard,
                        {
                          backgroundColor: COLORS.card,
                          borderColor: isSelected ? COLORS.accent : COLORS.accent + "55",
                        },
                        isSelected && {
                          backgroundColor: COLORS.accent + "11",
                        },
                      ]}
                      onPress={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt.id }))}
                      disabled={submitted}
                    >
                      <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: isSelected ? COLORS.accent : COLORS.dotDefault, justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                        <Text style={{ color: isSelected ? "#fff" : COLORS.text, fontWeight: "800", fontSize: 13 }}>
                          {String.fromCharCode(65 + i)}
                        </Text>
                      </View>
                      <Text style={[quizStyles.optionText, { color: COLORS.text, flex: 1 }]}>
                        {opt.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : null}
          </View>
        </ScrollView>

        <View style={quizStyles.bottomNav}>
          <TouchableOpacity
            disabled={currentIndex === 0}
            onPress={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            style={[
              quizStyles.navBtn,
              currentIndex === 0 && { opacity: 0.35 },
            ]}
          >
            <LinearGradient
              colors={[COLORS.accent, COLORS.accent]}
              style={quizStyles.navBtnInner}
            >
              <Text style={quizStyles.navText}>Previous</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={submitting || submitted}
            onPress={() => {
              if (currentIndex + 1 === totalQ) {
                submitChallenge();
              } else {
                setCurrentIndex(prev => Math.min(totalQ - 1, prev + 1));
              }
            }}
            style={quizStyles.navBtn}
          >
            <LinearGradient
              colors={currentIndex + 1 === totalQ ? ["#10b981", "#059669"] : [COLORS.accent, COLORS.accent]}
              style={quizStyles.navBtnInner}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={quizStyles.navText}>
                  {currentIndex + 1 === totalQ ? "Submit Challenge" : "Next"}
                </Text>
              )}
            </LinearGradient>
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

// Local extra styles that aren't in QuizScreen.styles
const styles = StyleSheet.create({
  textAreaContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    minHeight: 200,
    justifyContent: "center",
  },
});
