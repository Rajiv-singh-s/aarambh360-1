import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ImageBackground,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const MAP_WIDTH = width * 0.9;
const MAP_HEIGHT = MAP_WIDTH * 1.1; // roughly India's aspect ratio

// We use rough relative coordinates (0 to 1) to position hitboxes
const LOCATIONS = [
  { id: "thar", name: "Thar Desert", top: 0.35, left: 0.15, w: 0.2, h: 0.2 },
  { id: "himalayas", name: "Himalayas", top: 0.1, left: 0.3, w: 0.4, h: 0.15 },
  { id: "western_ghats", name: "Western Ghats", top: 0.6, left: 0.25, w: 0.15, h: 0.3 },
  { id: "chilika", name: "Chilika Lake", top: 0.55, left: 0.6, w: 0.1, h: 0.1 },
  { id: "kaziranga", name: "Kaziranga NP", top: 0.4, left: 0.8, w: 0.15, h: 0.1 },
];

export default function MapPracticeScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(LOCATIONS[0]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f0ff", "#ffffff"] as [string, string]),
    cardBg: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    accent: "#06b6d4",
  };

  useEffect(() => {
    loadHighScore();
  }, []);

  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const loadHighScore = async () => {
    const saved = await AsyncStorage.getItem("mapHighScore");
    if (saved) setHighScore(parseInt(saved));
  };

  const saveHighScore = async (newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      await AsyncStorage.setItem("mapHighScore", newScore.toString());
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setFeedback(null);
    pickNextTarget();
  };

  const endGame = () => {
    setIsPlaying(false);
    saveHighScore(score);
    Alert.alert("Time's Up!", `You scored ${score} points!`, [
      { text: "Play Again", onPress: startGame },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickNextTarget = () => {
    const randomLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    setCurrentTarget(randomLoc);
  };

  const handleTap = (locId: string) => {
    if (!isPlaying) return;

    if (locId === currentTarget.id) {
      setScore(score + 1);
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        pickNextTarget();
      }, 500);
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 500);
    }
  };

  const handleMiss = () => {
    if (!isPlaying) return;
    setFeedback("wrong");
    setTimeout(() => setFeedback(null), 500);
  };

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Map Practice</Text>
          <View style={styles.scoreBadge}>
            <Ionicons name="trophy" size={16} color="#fbbf24" />
            <Text style={styles.highScoreText}>{highScore}</Text>
          </View>
        </View>

        {/* HUD */}
        <View style={styles.hud}>
          <View style={[styles.hudBox, { backgroundColor: COLORS.cardBg }]}>
            <Text style={[styles.hudLabel, { color: COLORS.sub }]}>Score</Text>
            <Text style={[styles.hudValue, { color: COLORS.accent }]}>{score}</Text>
          </View>
          <View style={[styles.hudBox, { backgroundColor: COLORS.cardBg }]}>
            <Text style={[styles.hudLabel, { color: COLORS.sub }]}>Time</Text>
            <Text style={[styles.hudValue, { color: timeLeft <= 10 ? "#ef4444" : COLORS.text }]}>
              00:{timeLeft.toString().padStart(2, "0")}
            </Text>
          </View>
        </View>

        {/* Target Prompt */}
        <View style={styles.targetContainer}>
          {isPlaying ? (
            <>
              <Text style={[styles.findText, { color: COLORS.sub }]}>Locate:</Text>
              <Text style={[styles.targetText, { color: COLORS.text }]}>{currentTarget.name}</Text>
            </>
          ) : (
            <Text style={[styles.targetText, { color: COLORS.text }]}>Ready to play?</Text>
          )}
        </View>

        {/* Game Map Area */}
        <View style={styles.mapContainer}>
          <TouchableOpacity activeOpacity={1} onPress={handleMiss} style={styles.mapWrapper}>
            <ImageBackground
              source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/India_outline_map.svg/1024px-India_outline_map.svg.png" }}
              style={styles.mapImage}
              imageStyle={{ opacity: isDark ? 0.8 : 0.6, tintColor: isDark ? "#fff" : "#000" }}
            >
              {/* Hitboxes */}
              {LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={[
                    styles.hitbox,
                    {
                      top: loc.top * MAP_HEIGHT,
                      left: loc.left * MAP_WIDTH,
                      width: loc.w * MAP_WIDTH,
                      height: loc.h * MAP_HEIGHT,
                      // For debugging, uncomment the line below to see hitboxes
                      // backgroundColor: "rgba(255,0,0,0.2)",
                    },
                  ]}
                  onPress={() => handleTap(loc.id)}
                />
              ))}

              {/* Feedback Overlay */}
              {feedback && (
                <View style={[styles.feedbackOverlay, { backgroundColor: feedback === "correct" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)" }]}>
                  <Ionicons
                    name={feedback === "correct" ? "checkmark-circle" : "close-circle"}
                    size={80}
                    color={feedback === "correct" ? "#10b981" : "#ef4444"}
                  />
                </View>
              )}
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* Controls */}
        {!isPlaying && (
          <TouchableOpacity style={[styles.startBtn, { backgroundColor: COLORS.accent }]} onPress={startGame}>
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.startBtnText}>Start Game (30s)</Text>
          </TouchableOpacity>
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: { padding: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251,191,36,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  highScoreText: {
    color: "#fbbf24",
    fontWeight: "800",
    fontSize: 14,
  },
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  hudBox: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  hudLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  hudValue: {
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },
  targetContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  findText: {
    fontSize: 16,
    fontWeight: "700",
  },
  targetText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#10b981", // bright green prompt
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mapContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  mapWrapper: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  },
  mapImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  hitbox: {
    position: "absolute",
  },
  feedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 30,
    gap: 8,
  },
  startBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});
