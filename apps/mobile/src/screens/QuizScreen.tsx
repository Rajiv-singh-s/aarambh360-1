import SafeContainer from '../components/SafeContainer';
// src/screens/QuizScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  Modal,
  TextInput,
} from "react-native";

import { useRoute, useNavigation } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { useQuizEngine } from "../hooks/useQuizEngine";
import { apiPost } from "../services/apiClient";
import { trackLearningEvent } from "../services/analyticsService";
import { QuizSkeleton } from "../components/SkeletonLoader";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import ConfettiCannon from "react-native-confetti-cannon";
import { BlurView } from "expo-blur";

import styles from "./styles/QuizScreen.styles";

type RouteParams = {
  topicId?: string;
  subject?: string;
  subjectKey?: string;
  classKey?: string;
  count?: number;
};

interface NormalizedOption {
  key?: string;
  text: string;
  optionId?: string;
}

interface Question {
  id: string;
  question: string;
  options: NormalizedOption[];
  answerRaw: string;
  explanation: string;
}

export default function QuizScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();

  const params = (route.params || {}) as RouteParams;
  const topicId = params.topicId;
  const subject = params.subject ?? "General";
  const subjectKey = params.subjectKey ?? "default";
  const classKey = params.classKey ?? "0";
  const count = params.count ?? 25;

  const { startSession, submitAnswer, completeSession } = useQuizEngine();
  const questionStartRef = useRef(Date.now());
  const isDark = useColorScheme() === "dark";

  /* THEME */
  const COLORS = {
    bg: (isDark
      ? ["#0b1220", "#111b2e"]
      : ["#e9f3ff", "#ffffff"]) as [string, string],

    card: isDark ? "#1e293b" : "#ffffff",
    accent: isDark ? "#06b6d4" : "#0284c7",
    text: isDark ? "#ffffff" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",

    // dot system
    dotDefault: isDark ? "#334155" : "#cce4ff",
    correct: "#22c55e",
    wrong: "#ef4444",
  };

  /* STATES */
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(NormalizedOption | null)[]>([]);
  const [progressColors, setProgressColors] = useState<string[]>([]);

  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [streakExtendedToday, setStreakExtendedToday] = useState(false);

  /* REPORT POPUP */
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportText, setReportText] = useState("");
  const slideAnim = useRef(new Animated.Value(0)).current;

  /* STREAK POPUP */
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakMessage, setStreakMessage] = useState("");

  const popupScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  /* RESULT ANIMATION */
  const animatedPerc = useRef(new Animated.Value(0)).current;
  const [displayPerc, setDisplayPerc] = useState(0);
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  /* CARD ANIMATION */
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    cardOpacity.setValue(0);
    cardTranslateY.setValue(20);
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(cardTranslateY, { toValue: 0, duration: 400, useNativeDriver: true })
    ]).start();
  }, [currentIndex]);

  /* REFS */
  const progressScrollRef = useRef<ScrollView | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* BOOKMARKS */
  const [showBookmarkPopup, setShowBookmarkPopup] = useState(false);
  const [bookmarks, setBookmarks] = useState<{ [key: number]: boolean }>({});

  const saveBookmark = async () => {
    try {
      const q = questions[currentIndex];
      setBookmarks((prev) => ({ ...prev, [currentIndex]: true }));
      setShowBookmarkPopup(false);
      await apiPost("/bookmarks", {
        targetType: "QUESTION",
        targetId: q.id,
      });
    } catch (err) {
      console.error("Bookmark error:", err);
    }
  };

  /* LISTEN FOR RESULT % */
  useEffect(() => {
    const id = animatedPerc.addListener(({ value }) =>
      setDisplayPerc(Math.round(value))
    );
    return () => animatedPerc.removeListener(id);
  }, [animatedPerc]);

  /* TIMER */
  useEffect(() => {
    if (!quizCompleted && questions.length > 0) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setSecondsElapsed((s) => s + 1);
        }, 1000);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [quizCompleted, questions.length]);

  /* FETCH QUESTIONS FROM API */
  useEffect(() => {
    (async () => {
      if (!topicId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const session = await startSession(topicId, count);
        const mapped: Question[] = session.questions.map((q) => {
          const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
          return {
            id: q.id,
            question: q.text,
            options: shuffledOptions.map((opt) => ({
              key: opt.label,
              text: opt.text,
              optionId: opt.id,
            })),
            answerRaw: "",
            explanation: "",
          };
        });
        setQuestions(mapped);
        setAnswers(new Array(mapped.length).fill(null));
        setProgressColors(new Array(mapped.length).fill("neutral"));
        setCurrentIndex(0);
        setSecondsElapsed(0);
        setCorrectCount(0);
        setIncorrectCount(0);
        setQuizCompleted(false);
        questionStartRef.current = Date.now();
        animatedPerc.setValue(0);
      } catch (err) {
        console.log("Question Fetch Error:", err);
      }
      setLoading(false);
    })();
  }, [topicId, count, animatedPerc, startSession]);

  /* FORMAT TIME */
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /* CORRECTNESS LOGIC */
  const isOptionCorrect = (option: NormalizedOption, answerRaw: string) => {
    if (option.optionId && answerRaw) {
      return option.optionId === answerRaw;
    }
    const ans = (answerRaw ?? "").trim().toLowerCase();
    if (!ans) return false;
    const key = (option.key ?? "").trim().toLowerCase();
    const text = (option.text ?? "").trim().toLowerCase();
    if (key === ans || text === ans) return true;
    return false;
  };

  /* SELECT OPTION — server authoritative scoring */
  const selectOption = async (option: NormalizedOption) => {
    if (answers[currentIndex] || !option.optionId) return;

    const timeTakenSeconds = Math.max(
      1,
      Math.round((Date.now() - questionStartRef.current) / 1000),
    );

    try {
      const result = await submitAnswer(questions[currentIndex].id, option.optionId, timeTakenSeconds);
      const correct = result.isCorrect;

      const newProgress = [...progressColors];
      newProgress[currentIndex] = correct ? "correct" : "wrong";
      setProgressColors(newProgress);

      const newAnswers = [...answers];
      newAnswers[currentIndex] = option;
      setAnswers(newAnswers);

      if (correct) setCorrectCount((c) => c + 1);
      else setIncorrectCount((c) => c + 1);

      setQuestions((prev) =>
        prev.map((item, index) =>
          index === currentIndex
            ? {
                ...item,
                answerRaw: result.correctOptionId,
                explanation: result.explanation ?? "",
              }
            : item,
        ),
      );

      progressScrollRef.current?.scrollTo({
        x: (currentIndex + 1) * 40,
        animated: true,
      });
    } catch (err) {
      console.log("Submit answer error:", err);
    }
  };

  /* NAVIGATION */
  const next = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      questionStartRef.current = Date.now();

      progressScrollRef.current?.scrollTo({
        x: (currentIndex + 1) * 40,
        animated: true,
      });
    } else {
      finishQuiz();
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);

      progressScrollRef.current?.scrollTo({
        x: (currentIndex - 1) * 40,
        animated: true,
      });
    }
  };

  /* FINISH QUIZ */
  const finishQuiz = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const result = await completeSession();
      setQuizCompleted(true);
      if (result.streakExtendedToday) {
        setStreakExtendedToday(true);
      }

      trackLearningEvent({
        eventType: "QUIZ_COMPLETED",
        entityType: "QuizSession",
        entityId: result.sessionId,
        metadata: {
          topicId,
          subject,
          correctCount: result.correctCount,
          incorrectCount: result.incorrectCount,
          totalQuestions: result.totalQuestions,
          accuracy: result.accuracy,
          timeTakenSeconds: result.timeTakenSeconds,
        },
      }).catch((err) => console.error("Error tracking QUIZ_COMPLETED:", err));

      Animated.timing(animatedPerc, {
        toValue: result.accuracy,
        duration: 1200,
        useNativeDriver: false,
      }).start();

    } catch (err) {
      console.log("Complete session error:", err);
      setQuizCompleted(true);
    }
  };

  /* REPORT MODAL */
  const openReport = () => {
    setShowReportPopup(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const closeReport = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowReportPopup(false);
      setReportText("");
    });
  };

  const submitReport = async () => {
    const words = reportText.trim().split(/\s+/);
    if (words.length < 5 || words.length > 50) {
      alert("Please enter between 5 and 50 words.");
      return;
    }

    const q = questions[currentIndex];
    console.log("Report submitted:", q.id, reportText.trim());
    closeReport();
  };

  /* STREAK handled server-side on session complete */
  const handleContinue = async () => {
    if (streakExtendedToday) {
      setStreakMessage("Streak updated on the server. Keep practicing!");
      setShowConfetti(true);
      setShowStreakPopup(true);
    } else {
      navigation.goBack();
    }
  };

  /* STREAK ANIMATION */
  useEffect(() => {
    if (showStreakPopup) {
      popupScale.setValue(0);

      Animated.spring(popupScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.97,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );

      loop.start();
      return () => loop.stop();
    }
  }, [showStreakPopup, popupScale, pulseAnim]);

  /* RESULT SCREEN */
  if (loading) {
    return (
      <LinearGradient colors={COLORS.bg} style={styles.center}>
        <SafeContainer style={{ flex: 1, width: "100%" }}>
          <QuizSkeleton />
        </SafeContainer>
      </LinearGradient>
    );
  }

  if (quizCompleted) {
    const totalMarks = correctCount * 2 - incorrectCount * 0.66;
    const maxMarks = questions.length * 2;

    const radius = 60;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;

    const strokeDashoffset = animatedPerc.interpolate({
      inputRange: [0, 100],
      outputRange: [circumference, 0],
    });

    return (
      <LinearGradient colors={COLORS.bg} style={styles.safe}>
        <SafeContainer style={styles.resultBox}>
          {showConfetti && (
            <ConfettiCannon count={120} origin={{ x: 180, y: 0 }} fadeOut />
          )}

          <View
            style={[
              styles.resultCard,
              { backgroundColor: COLORS.card, borderColor: COLORS.accent },
            ]}
          >
            <Text style={[styles.resultTitle, { color: COLORS.text }]}>
              Your Report
            </Text>

            <Svg width={160} height={160}>
              <Circle
                stroke={isDark ? "#334155" : "#cbd5e1"}
                fill="none"
                cx="80"
                cy="80"
                r={radius}
                strokeWidth={strokeWidth}
              />

              <AnimatedCircle
                stroke={COLORS.accent}
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

            <Text style={[styles.resultPerc, { color: COLORS.accent }]}>
              {displayPerc}%
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 24, width: "100%" }}>
              {/* Box 1: Correct */}
              <View style={{ width: "48%", backgroundColor: "#10b9811a", padding: 16, borderRadius: 18, alignItems: "center", marginBottom: 12, borderBottomWidth: 3, borderColor: "#10b981" }}>
                <Ionicons name="checkmark-circle" size={26} color="#10B981" />
                <Text style={{ color: COLORS.text, fontSize: 11, fontWeight: "800", marginTop: 8, opacity: 0.6, letterSpacing: 1 }}>CORRECT</Text>
                <Text style={{ color: "#10b981", fontSize: 22, fontWeight: "900", marginTop: 2 }}>{correctCount}</Text>
              </View>

              {/* Box 2: Incorrect */}
              <View style={{ width: "48%", backgroundColor: "#ef44441a", padding: 16, borderRadius: 18, alignItems: "center", marginBottom: 12, borderBottomWidth: 3, borderColor: "#ef4444" }}>
                <Ionicons name="close-circle" size={26} color="#EF4444" />
                <Text style={{ color: COLORS.text, fontSize: 11, fontWeight: "800", marginTop: 8, opacity: 0.6, letterSpacing: 1 }}>INCORRECT</Text>
                <Text style={{ color: "#ef4444", fontSize: 22, fontWeight: "900", marginTop: 2 }}>{incorrectCount}</Text>
              </View>

              {/* Box 3: Marks */}
              <View style={{ width: "48%", backgroundColor: COLORS.accent + "1a", padding: 16, borderRadius: 18, alignItems: "center", marginBottom: 12, borderBottomWidth: 3, borderColor: COLORS.accent }}>
                <Ionicons name="trophy" size={26} color={COLORS.accent} />
                <Text style={{ color: COLORS.text, fontSize: 11, fontWeight: "800", marginTop: 8, opacity: 0.6, letterSpacing: 1 }}>MARKS</Text>
                <Text style={{ color: COLORS.accent, fontSize: 22, fontWeight: "900", marginTop: 2 }}>{totalMarks.toFixed(2)}</Text>
              </View>

              {/* Box 4: Time */}
              <View style={{ width: "48%", backgroundColor: COLORS.accent + "1a", padding: 16, borderRadius: 18, alignItems: "center", marginBottom: 12, borderBottomWidth: 3, borderColor: COLORS.accent }}>
                <Ionicons name="time" size={26} color={COLORS.accent} />
                <Text style={{ color: COLORS.text, fontSize: 11, fontWeight: "800", marginTop: 8, opacity: 0.6, letterSpacing: 1 }}>TIME</Text>
                <Text style={{ color: COLORS.accent, fontSize: 20, fontWeight: "900", marginTop: 2 }}>{formatSeconds(secondsElapsed)}</Text>
              </View>
            </View>

            {/* BUTTONS */}
            <View style={{ width: "100%", marginTop: 12 }}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={{ backgroundColor: COLORS.accent, paddingVertical: 16, borderRadius: 16, borderBottomWidth: 4, borderColor: "#0284c7", marginBottom: 12, alignItems: "center" }}
                onPress={() => {
                  const first = answers.findIndex((a) => a !== null);
                  setCurrentIndex(first >= 0 ? first : 0);
                  setQuizCompleted(false);
                  setReviewMode(true);
                }}
              >
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 }}>
                  Review Answers
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={{ backgroundColor: "transparent", paddingVertical: 16, borderRadius: 16, borderWidth: 2, borderColor: COLORS.accent, alignItems: "center" }}
                onPress={handleContinue}
              >
                <Text style={{ color: COLORS.accent, fontSize: 15, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 }}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* STREAK POPUP */}
          <Modal visible={showStreakPopup} transparent animationType="fade">
            <View style={styles.popupOverlay}>
              <BlurView
                intensity={35}
                tint={isDark ? "dark" : "light"}
                pointerEvents="none"
                style={styles.fullscreenBlur}
              />

              <Animated.View
                style={[
                  styles.popupCardBig,
                  {
                    backgroundColor: isDark
                      ? "rgba(30,41,59,0.97)"
                      : "rgba(255,255,255,0.97)",
                    transform: [
                      {
                        scale: Animated.multiply(
                          popupScale.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.6, 1],
                          }),
                          pulseAnim
                        ),
                      },
                    ],
                  },
                ]}
              >
                <View style={[styles.streakBadge, { backgroundColor: COLORS.accent }]}>
                  <Ionicons name="flame" size={20} color="#fff" />
                  <Text style={[styles.streakBadgeText, { color: "#fff" }]}>
                    {streakMessage.match(/\d+/)
                      ? `Day ${streakMessage.match(/\d+/)?.[0]}`
                      : "🔥"}
                  </Text>
                </View>

                <Text style={[styles.popupTextLarge, { color: COLORS.accent }]}>
                  {streakMessage}
                </Text>

                <Text
                  style={[
                    styles.popupSubText,
                    { color: isDark ? "#cbd5e1" : "#475569" },
                  ]}
                >
                  Keep your streak going — consistency builds mastery!
                </Text>

                <TouchableOpacity
                  style={[styles.okBtn, { backgroundColor: COLORS.accent }]}
                  onPress={() => {
                    setShowStreakPopup(false);
                    setShowConfetti(false);
                    navigation.goBack();
                  }}
                >
                  <Text style={[styles.btnText, { color: "#fff" }]}>OK</Text>
                </TouchableOpacity>
              </Animated.View>

              {showConfetti && (
                <View style={styles.confettiLayer}>
                  <ConfettiCannon
                    count={120}
                    origin={{ x: 200, y: 0 }}
                    fadeOut
                    autoStart
                  />
                </View>
              )}
            </View>
          </Modal>
        </SafeContainer>
      </LinearGradient>
    );
  }

  /* REVIEW MODE */
  if (reviewMode) {
    const q = questions[currentIndex];

    return (
      <LinearGradient colors={COLORS.bg} style={styles.safe}>
        <SafeContainer style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => {
                  setReviewMode(false);
                  setQuizCompleted(true);
                }}
              >
                <Ionicons name="arrow-back" size={22} color={COLORS.accent} />
              </TouchableOpacity>

              <Text style={[styles.headerTitle, { color: COLORS.text }]}>
                Review Answers
              </Text>

              <Text style={[styles.timer, { color: COLORS.sub }]}>
                {currentIndex + 1}/{questions.length}
              </Text>
            </View>

            <View
              style={[
                styles.reviewCard,
                { backgroundColor: COLORS.card, borderColor: COLORS.accent },
              ]}
            >
              <Text style={[styles.reviewQNo, { color: COLORS.accent }]}>
                Question {currentIndex + 1}
              </Text>

              <Text style={[styles.question, { color: COLORS.text }]}>
                {q.question}
              </Text>

              {q.options.map((opt, i) => {
                const correct = isOptionCorrect(opt, q.answerRaw);
                const chosen =
                  answers[currentIndex]?.key === opt.key &&
                  answers[currentIndex]?.text === opt.text;

                return (
                  <View
                    key={i}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: COLORS.card,
                        borderColor: COLORS.accent + "55",
                      },
                      correct && {
                        backgroundColor: "#16a34a33",
                        borderColor: "#16a34a",
                      },
                      chosen &&
                        !correct && {
                          backgroundColor: "#ef444433",
                          borderColor: "#ef4444",
                        },
                    ]}
                  >
                    <Text style={[styles.optionText, { color: COLORS.text }]}>
                      {String.fromCharCode(65 + i)}. {opt.text}
                    </Text>
                  </View>
                );
              })}

              <View
                style={[
                  styles.explanationBox,
                  { borderLeftColor: COLORS.accent, backgroundColor: COLORS.card },
                ]}
              >
                <Text
                  style={[styles.explanationTitle, { color: COLORS.accent }]}
                >
                  Explanation:
                </Text>
                <Text style={[styles.explanationText, { color: COLORS.sub }]}>
                  {q.explanation || "No explanation provided."}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.bottomNav}>
            <TouchableOpacity
              disabled={currentIndex === 0}
              onPress={prev}
              style={[
                styles.navBtn,
                currentIndex === 0 && { opacity: 0.35 },
              ]}
            >
              <LinearGradient
                colors={[COLORS.accent, COLORS.accent]}
                style={styles.navBtnInner}
              >
                <Text style={styles.navText}>Previous</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (currentIndex + 1 === questions.length) {
                  setReviewMode(false);
                  setQuizCompleted(true);
                } else next();
              }}
              style={styles.navBtn}
            >
              <LinearGradient
                colors={[COLORS.accent, COLORS.accent]}
                style={styles.navBtnInner}
              >
                <Text style={styles.navText}>
                  {currentIndex + 1 === questions.length ? "Finish" : "Next"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeContainer>
      </LinearGradient>
    );
  }

  /* MAIN QUIZ UI */
  const q = questions[currentIndex];

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.accent} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: COLORS.text }]}>
              {subject}
            </Text>

            <View style={{ width: 22 }} />
          </View>

          {/* PROGRESS DOTS */}
          <ScrollView
            ref={progressScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.progressRow}
          >
            {progressColors.map((state, i) => {
              let color = COLORS.dotDefault;

              if (state === "correct") color = COLORS.correct;
              else if (state === "wrong") color = COLORS.wrong;

              const isSelected = currentIndex === i;

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
                      styles.progressDot,
                      {
                        backgroundColor: color,
                        borderColor: isSelected
                          ? COLORS.accent
                          : "transparent",
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.dotText, { color: COLORS.text }]}>
                      {i + 1}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* TOP INFO CARD */}
          <View
            style={[
              styles.topInfoCard,
              { backgroundColor: COLORS.card, borderColor: COLORS.accent + "22" },
            ]}
          >
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: COLORS.sub }]}>QUESTION</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>
                {currentIndex + 1}/{questions.length}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: COLORS.sub }]}>SCORE</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>
                {(correctCount * 2 - incorrectCount * 0.66).toFixed(2)}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: COLORS.sub }]}>TIME</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>
                {formatSeconds(secondsElapsed)}
              </Text>
            </View>
          </View>

          {/* QUESTION CARD */}
          <Animated.View
            style={[
              styles.card,
              { 
                backgroundColor: COLORS.card, 
                borderColor: COLORS.accent + "22",
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslateY }]
              },
            ]}
          >
            <Text style={[styles.question, { color: COLORS.text }]}>
              {q.question}
            </Text>

            {q.options.map((opt, i) => {
              const answered = answers[currentIndex] !== null;
              const selected =
                answers[currentIndex]?.key === opt.key &&
                answers[currentIndex]?.text === opt.text;
              const correct = isOptionCorrect(opt, q.answerRaw);

              return (
                <TouchableOpacity
                  key={i}
                  disabled={answered}
                  activeOpacity={0.6}
                  onPress={() => selectOption(opt)}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: COLORS.card,
                      borderColor: COLORS.accent + "33",
                    },
                    answered &&
                      correct && {
                        backgroundColor: "#16a34a33",
                        borderColor: "#16a34a",
                      },
                    answered &&
                      selected &&
                      !correct && {
                        backgroundColor: "#ef444433",
                        borderColor: "#ef4444",
                      },
                  ]}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: (answered && (selected || correct)) ? "#ffffff33" : COLORS.accent + "22", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <Text style={{ color: (answered && (selected || correct)) ? COLORS.text : COLORS.accent, fontWeight: "900", fontSize: 14 }}>{String.fromCharCode(65 + i)}</Text>
                  </View>
                  <Text style={[styles.optionText, { color: COLORS.text, flex: 1 }]}>
                    {opt.text}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {answers[currentIndex] && (
              <View
                style={[
                  styles.explanationBox,
                  {
                    backgroundColor: isDark ? "#1e293b" : "#e2e8f0",
                    borderLeftColor: COLORS.accent,
                  },
                ]}
              >
                <Text
                  style={[styles.explanationTitle, { color: COLORS.accent }]}
                >
                  Explanation:
                </Text>
                <Text style={[styles.explanationText, { color: COLORS.sub }]}>
                  {q.explanation || "No explanation provided."}
                </Text>
              </View>
            )}

            {/* ACTIONS */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => setShowBookmarkPopup(true)}
              >
                <Ionicons
                  name={bookmarks[currentIndex] ? "bookmark" : "bookmark-outline"}
                  size={22}
                  color={COLORS.accent}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={openReport}>
                <Ionicons name="flag-outline" size={22} color="#ef4444" />
              </TouchableOpacity>

              <TouchableOpacity onPress={next}>
                <Ionicons
                  name="play-skip-forward-outline"
                  size={22}
                  color={COLORS.sub}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>

        {/* BOTTOM NAV */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            disabled={currentIndex === 0}
            onPress={prev}
            style={[
              styles.navBtn,
              currentIndex === 0 && { opacity: 0.35 },
            ]}
          >
            <LinearGradient
              colors={[COLORS.accent, COLORS.accent]}
              style={styles.navBtnInner}
            >
              <Text style={styles.navText}>Previous</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={next} style={styles.navBtn}>
            <LinearGradient
              colors={[COLORS.accent, COLORS.accent]}
              style={styles.navBtnInner}
            >
              <Text style={styles.navText}>
                {currentIndex + 1 === questions.length ? "Finish" : "Next"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeContainer>

      <Modal visible={showBookmarkPopup} transparent animationType="fade">
        <View style={styles.modalWrapper}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setShowBookmarkPopup(false)}
          />
          <View style={[styles.popupCardBig, { backgroundColor: isDark ? "#1e293b" : "#ffffff", paddingVertical: 24, width: "90%" }]}>
            <View style={{ backgroundColor: "#0ea5e91a", padding: 16, borderRadius: 40, marginBottom: 12 }}>
              <Ionicons name="bookmark" size={36} color={COLORS.accent} />
            </View>
            <Text style={[styles.popupTextLarge, { color: COLORS.text, fontSize: 20 }]}>
              Bookmark Question?
            </Text>
            <Text style={[styles.popupSubText, { color: COLORS.sub, fontSize: 14 }]}>
              Save this question to review it later in your bookmarks.
            </Text>
            <View style={{ flexDirection: "row", marginTop: 10, width: "100%", justifyContent: "space-between" }}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "transparent", borderWidth: 2, borderColor: COLORS.sub, flex: 1, marginRight: 8, alignItems: "center", borderRadius: 14 }]}
                onPress={() => setShowBookmarkPopup(false)}
              >
                <Text style={[styles.btnText, { color: COLORS.sub }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: COLORS.accent, borderBottomWidth: 4, borderColor: "#0284c7", flex: 1, marginLeft: 8, alignItems: "center", borderRadius: 14 }]}
                onPress={saveBookmark}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* REPORT POPUP */}
      <Modal visible={showReportPopup} transparent animationType="fade">
        <View style={styles.modalWrapper}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeReport}
          />
          <Animated.View
            style={[
              styles.popupCardBig,
              {
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                paddingVertical: 24,
                width: "90%",
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={{ backgroundColor: "#ef44441a", padding: 16, borderRadius: 40, marginBottom: 12 }}>
              <Ionicons name="flag" size={36} color="#ef4444" />
            </View>
            <Text style={[styles.popupTextLarge, { color: COLORS.text, fontSize: 20 }]}>
              Report Question
            </Text>
            <Text style={[styles.popupSubText, { color: COLORS.sub, fontSize: 14, marginBottom: 12 }]}>
              Found an error? Let us know.
            </Text>

            <TextInput
              value={reportText}
              onChangeText={setReportText}
              placeholder="Type your reason (5–50 words)…"
              placeholderTextColor={COLORS.sub}
              multiline
              style={[
                styles.reportInput,
                {
                  backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  color: COLORS.text,
                  width: "100%",
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#e2e8f0"
                },
              ]}
            />

            <View style={{ flexDirection: "row", marginTop: 4, width: "100%", justifyContent: "space-between" }}>
              <TouchableOpacity
                onPress={closeReport}
                style={[styles.btn, { backgroundColor: "transparent", borderWidth: 2, borderColor: COLORS.sub, flex: 1, marginRight: 8, alignItems: "center", borderRadius: 14 }]}
              >
                <Text style={[styles.btnText, { color: COLORS.sub }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={submitReport}
                style={[styles.btn, { backgroundColor: "#ef4444", borderBottomWidth: 4, borderColor: "#b91c1c", flex: 1, marginLeft: 8, alignItems: "center", borderRadius: 14 }]}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>Submit</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
}
