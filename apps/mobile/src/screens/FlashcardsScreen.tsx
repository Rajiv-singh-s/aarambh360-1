import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useColorScheme,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";

const { width } = Dimensions.get("window");

const DUMMY_CARDS = [
  {
    id: "1",
    tag: "Polity",
    question: "Which Article of the Constitution deals with the Election Commission of India?",
    answer: "Article 324\n\nIt grants the power of superintendence, direction, and control of elections to parliament, state legislatures, the office of president of India and the office of vice-president of India to the Election Commission.",
  },
  {
    id: "2",
    tag: "History",
    question: "Who was the founder of the Indian National Congress?",
    answer: "A.O. Hume\n\nFounded in 1885. The first session was held in Bombay, presided over by W.C. Bonnerjee.",
  },
  {
    id: "3",
    tag: "Geography",
    question: "What is the difference between Bhabar and Terai regions?",
    answer: "Bhabar is a narrow belt parallel to the Shiwalik foothills where streams disappear due to highly porous gravel.\n\nTerai lies south of Bhabar, where streams re-emerge, creating a wet, swampy, and marshy region with thick forests.",
  },
];

export default function FlashcardsScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const animatedValue = useRef(new Animated.Value(0)).current;

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f0ff", "#ffffff"] as [string, string]),
    cardBg: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
  };

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const flipCard = () => {
    if (isFlipped) {
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    // Reset flip
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(false);
      if (currentIndex < DUMMY_CARDS.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        navigation.goBack(); // Finished
      }
    });
  };

  const currentCard = DUMMY_CARDS[currentIndex];

  if (!currentCard) return null;

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.progressBox}>
            <Text style={[styles.progressText, { color: COLORS.sub }]}>
              {currentIndex + 1} / {DUMMY_CARDS.length}
            </Text>
            <View style={[styles.progressBarBg, { backgroundColor: COLORS.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${((currentIndex + 1) / DUMMY_CARDS.length) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Flashcard Area */}
        <View style={styles.cardContainer}>
          <TouchableOpacity activeOpacity={1} onPress={flipCard} style={styles.cardWrapper}>
            {/* FRONT OF CARD */}
            <Animated.View
              style={[
                styles.card,
                { backgroundColor: COLORS.cardBg, borderColor: COLORS.border },
                {
                  opacity: frontOpacity,
                  transform: [{ rotateY: frontInterpolate }],
                },
              ]}
            >
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{currentCard.tag}</Text>
              </View>
              <Text style={[styles.questionText, { color: COLORS.text }]}>
                {currentCard.question}
              </Text>
              <Text style={styles.tapToFlip}>Tap to reveal answer</Text>
            </Animated.View>

            {/* BACK OF CARD */}
            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                { backgroundColor: COLORS.cardBg, borderColor: COLORS.border },
                {
                  opacity: backOpacity,
                  transform: [{ rotateY: backInterpolate }],
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={40} color="#10b981" style={{ marginBottom: 20 }} />
              <Text style={[styles.answerText, { color: COLORS.text }]}>
                {currentCard.answer}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons (Only visible when flipped) */}
        <View style={styles.actionContainer}>
          {isFlipped ? (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#ef4444" }]}
                onPress={nextCard}
              >
                <Ionicons name="close-circle-outline" size={24} color="#fff" />
                <Text style={styles.actionBtnText}>Review Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#10b981" }]}
                onPress={nextCard}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                <Text style={styles.actionBtnText}>Got It</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.hintText, { color: COLORS.sub }]}>
              Recall the answer before flipping!
            </Text>
          )}
        </View>
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
    marginTop: 10,
    marginBottom: 20,
  },
  backBtn: {
    padding: 8,
  },
  progressBox: {
    flex: 1,
    marginLeft: 16,
    marginRight: 24,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#06b6d4",
    borderRadius: 3,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    width: width * 0.85,
    height: width * 1.1,
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardBack: {
    position: "absolute",
    top: 0,
  },
  tagBadge: {
    position: "absolute",
    top: 20,
    backgroundColor: "rgba(6,182,212,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: "#06b6d4",
    fontWeight: "800",
    fontSize: 12,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 34,
  },
  answerText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 28,
  },
  tapToFlip: {
    position: "absolute",
    bottom: 24,
    color: "#06b6d4",
    fontWeight: "700",
    fontSize: 14,
  },
  actionContainer: {
    height: 100,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    marginLeft: 8,
  },
  hintText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },
});
