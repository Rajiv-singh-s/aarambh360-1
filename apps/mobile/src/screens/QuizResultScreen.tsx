import SafeContainer from '../components/SafeContainer';
// src/screens/QuizResultScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Animated,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import ConfettiCannon from "react-native-confetti-cannon";
import Svg, { Circle } from "react-native-svg";

interface NormalizedOption {
  key?: string;
  text: string;
  optionId?: string;
}

interface Question {
  id?: string;
  question: string;
  options: NormalizedOption[];
  answerRaw: string;
  explanation: string;
}

type RouteParams = {
  sessionId?: string;
  questions?: Question[];
  answers?: (NormalizedOption | null)[];
  correctCount?: number;
  incorrectCount?: number;
  totalQuestions?: number;
  accuracy?: number;
  timeTakenSeconds?: number;
  timeTaken?: string;
  subject?: string;
  subjectKey?: string;
  classKey?: string;
};

export default function QuizResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params: RouteParams = route.params || {};

  const questions: Question[] = params.questions ?? [];
  const answers: (NormalizedOption | null)[] = params.answers ?? [];
  const correctCount: number = params.correctCount ?? 0;
  const incorrectCount: number = params.incorrectCount ?? 0;
  const totalQuestions: number = params.totalQuestions ?? 0;
  const timeTaken: string =
    params.timeTaken ??
    (params.timeTakenSeconds != null
      ? `${String(Math.floor(params.timeTakenSeconds / 60)).padStart(2, "0")}:${String(params.timeTakenSeconds % 60).padStart(2, "0")}`
      : "00:00");
  const subject: string = params.subject ?? "General";

  const totalMarks = correctCount * 2 - incorrectCount * 0.66;
  const maxMarks = totalQuestions * 2;
  const accuracy =
    params.accuracy ??
    (totalQuestions > 0 ? Math.max(0, (totalMarks / maxMarks) * 100) : 0);

  const [reviewMode, setReviewMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [streakMessage, setStreakMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const popupScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animatedPerc = useRef(new Animated.Value(0)).current;
  const [displayPerc, setDisplayPerc] = useState(0);
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  useEffect(() => {
    const listenerId: string | number = animatedPerc.addListener(({ value }) =>
      setDisplayPerc(Math.round(value))
    );

    Animated.timing(animatedPerc, {
      toValue: accuracy,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    return () => {
      // @ts-ignore
      animatedPerc.removeListener(listenerId);
    };
  }, [accuracy, animatedPerc]);

  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = animatedPerc.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  /* ---------------------------------------------
     Handle Continue (STREAK)
  --------------------------------------------- */
  const handleContinue = async (): Promise<void> => {
    setStreakMessage("Great work! Your streak was updated when you completed the quiz.");
    setShowStreakPopup(true);
    setShowConfetti(true);
  };

  /* ---------------------------------------------
     Popup Animations
  --------------------------------------------- */
  useEffect(() => {
    if (showStreakPopup) {
      popupScale.setValue(0);

      Animated.spring(popupScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 80,
      }).start();
    }
  }, [showStreakPopup, popupScale]);

  useEffect(() => {
    if (showStreakPopup) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );

      pulse.start();
      return () => pulse.stop();
    }
  }, [showStreakPopup, pulseAnim]);

  /* ---------------------------------------------
     REVIEW MODE
  --------------------------------------------- */
  const isCorrect = (opt: NormalizedOption, ans: string): boolean => {
    if (opt.optionId && ans) return opt.optionId === ans;
    const a = ans.trim().toLowerCase();
    if (!a) return false;
    if (opt.key?.trim().toLowerCase() === a) return true;
    if (opt.text.trim().toLowerCase() === a) return true;
    const stripped = a.replace(/^[a-z0-9.)\-:\s]+/i, "").trim();
    return !!stripped && opt.text.trim().toLowerCase() === stripped;
  };

  if (reviewMode) {
    const q = questions[currentIndex];

    return (
      <LinearGradient colors={["#0b1220", "#111b2e"]} style={styles.safe}>
        <SafeContainer style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setReviewMode(false)}>
                <Ionicons name="arrow-back" size={22} color="#06b6d4" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Review</Text>

              <Text style={styles.timer}>
                {currentIndex + 1}/{questions.length}
              </Text>
            </View>

            {q && (
              <View style={styles.reviewCard}>
                <Text style={styles.reviewQNo}>Question {currentIndex + 1}</Text>

                <Text style={styles.question}>{q.question}</Text>

                {q.options?.map((opt: NormalizedOption, i: number) => {
                  const correct = isCorrect(opt, q.answerRaw);
                  const sel =
                    answers[currentIndex]?.key === opt.key &&
                    answers[currentIndex]?.text === opt.text;

                  return (
                    <View
                      key={i}
                      style={[
                        styles.optionCard,
                        correct
                          ? { backgroundColor: "#16a34a33", borderColor: "#16a34a" }
                          : sel
                          ? { backgroundColor: "#ef444433", borderColor: "#ef4444" }
                          : {},
                      ]}
                    >
                      <Text style={styles.optionText}>
                        {String.fromCharCode(65 + i)}. {opt.text}
                      </Text>
                    </View>
                  );
                })}

                <View style={styles.explanationBox}>
                  <Text style={styles.explanationTitle}>Explanation:</Text>
                  <Text style={styles.explanationText}>
                    {q.explanation || "No explanation provided."}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={[styles.navBtn, currentIndex === 0 && { opacity: 0.4 }]}
              disabled={currentIndex === 0}
              onPress={() => setCurrentIndex((i) => i - 1)}
            >
              <Text style={styles.navText}>⬅ Prev</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => {
                if (currentIndex + 1 === questions.length) {
                  setReviewMode(false);
                } else setCurrentIndex((i) => i + 1);
              }}
            >
              <Text style={styles.navText}>
                {currentIndex + 1 === questions.length ? "Finish Review" : "Next ➡"}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeContainer>
      </LinearGradient>
    );
  }

  /* ---------------------------------------------
     MAIN RESULT UI
  --------------------------------------------- */
  return (
    <LinearGradient colors={["#0b1220", "#111b2e"]} style={styles.safe}>
      <SafeContainer style={styles.resultBox}>
        {showConfetti && <ConfettiCannon count={120} origin={{ x: 180, y: 0 }} fadeOut />}

        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Your Report</Text>

          <Svg width={160} height={160}>
            <Circle stroke="#334155" fill="none" cx="80" cy="80" r={radius} strokeWidth={strokeWidth} />
            <AnimatedCircle
              stroke="#06b6d4"
              fill="none"
              cx="80"
              cy="80"
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              originX="80"
              originY="80"
            />
          </Svg>

          <Text style={styles.resultPerc}>{displayPerc}%</Text>

          <View style={styles.resultDetails}>
            <Text style={styles.resultText}>🧠 {subject}</Text>
            <Text style={styles.resultText}>✅ Correct: {correctCount}</Text>
            <Text style={styles.resultText}>❌ Wrong: {incorrectCount}</Text>
            <Text style={styles.resultText}>
              🏁 Marks: {totalMarks.toFixed(2)} / {maxMarks}
            </Text>
            <Text style={styles.resultText}>⏱ Time: {timeTaken}</Text>
          </View>

          <View style={styles.resultButtons}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#06b6d4" }]}
              onPress={() => {
                const first = answers.findIndex((a: NormalizedOption | null) => a !== null);
                setCurrentIndex(first >= 0 ? first : 0);
                setReviewMode(true);
              }}
            >
              <Text style={styles.btnText}>Review Answers</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, { backgroundColor: "#94a3b8" }]} onPress={handleContinue}>
              <Text style={styles.btnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STREAK POPUP */}
        <Modal visible={showStreakPopup} transparent animationType="fade">
          <View style={styles.popupOverlay}>
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFillObject} />

            <Animated.View
              style={[
                styles.popupCardBig,
                {
                  transform: [
                    {
                      scale: Animated.multiply(popupScale, pulseAnim),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={20} color="#fff" />
                <Text style={styles.streakBadgeText}>
                  {streakMessage.match(/\d+/) ? `Day ${streakMessage.match(/\d+/)?.[0]}` : "🔥"}
                </Text>
              </View>

              <Text style={styles.popupTextLarge}>{streakMessage}</Text>

              <Text style={styles.popupSubText}>Keep going… Consistency builds mastery 💪</Text>

              <TouchableOpacity
                style={[styles.btn, styles.okBtn]}
                onPress={() => {
                  setShowStreakPopup(false);
                  setShowConfetti(false);
                  navigation.navigate("ExamHomeScreen");
                }}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>OK</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      </SafeContainer>
    </LinearGradient>
  );
}

/* ---------------------------------------------
   STYLES
--------------------------------------------- */
const styles = StyleSheet.create({
  safe: { flex: 1 },

  /* RESULT */
  resultBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "85%",
  },
  resultTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  resultPerc: {
    color: "#06b6d4",
    fontSize: 34,
    fontWeight: "800",
    marginVertical: 6,
  },
  resultDetails: {
    marginTop: 10,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 12,
    width: "90%",
  },
  resultText: { color: "#cbd5e1", fontSize: 15, marginVertical: 3 },

  resultButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },

  btn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  btnText: {
    color: "#012028",
    fontWeight: "800",
    textAlign: "center",
  },

  /* HEADER (Review Mode) */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 14,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  timer: { color: "#94a3b8", fontSize: 14 },

  /* REVIEW */
  reviewCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
    marginHorizontal: 16,
  },
  reviewQNo: {
    color: "#06b6d4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  question: { color: "#fff", fontSize: 15, marginBottom: 14 },

  optionCard: {
    backgroundColor: "#3d4f6a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 6,
  },
  optionText: {
    color: "#fff",
    fontSize: 15,
  },

  explanationBox: {
    marginTop: 14,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#06b6d4",
  },
  explanationTitle: { color: "#06b6d4", fontWeight: "700" },
  explanationText: { color: "#cbd5e1", lineHeight: 20 },

  bottomNav: {
    backgroundColor: "#0f172a",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navBtn: {
    backgroundColor: "#06b6d4",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  navText: { color: "#012028", fontWeight: "800" },

  /* POPUP */
  popupOverlay: {
    flex: 1,
    backgroundColor: "#00000080",
    justifyContent: "center",
    alignItems: "center",
  },
  popupCardBig: {
    backgroundColor: "rgba(10, 25, 47, 0.95)",
    borderRadius: 25,
    paddingVertical: 40,
    paddingHorizontal: 25,
    alignItems: "center",
    width: "85%",
    borderWidth: 1.5,
    borderColor: "#06b6d4",
  },
  popupTextLarge: {
    color: "#06b6d4",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
  },
  popupSubText: {
    color: "#cbd5e1",
    fontSize: 15,
    textAlign: "center",
    maxWidth: "85%",
    marginBottom: 20,
  },
  streakBadge: {
    flexDirection: "row",
    backgroundColor: "#06b6d4",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 15,
  },
  streakBadgeText: {
    color: "#fff",
    fontWeight: "800",
    marginLeft: 6,
    fontSize: 16,
  },
  okBtn: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
