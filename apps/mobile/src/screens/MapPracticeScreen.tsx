import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import IndiaMapSvg from "../components/IndiaMapSvg";
import indiaData from "../utils/indiaMapData";

const { width } = Dimensions.get("window");
const MAP_WIDTH = width * 0.95;
const MAP_HEIGHT = MAP_WIDTH * 1.15; // India aspect ratio

const LOCATIONS = indiaData.locations;

export default function MapPracticeScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTarget, setCurrentTarget] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    setTimeLeft(60);
    setIsPlaying(true);
    setFeedback(null);
    setSelectedId(null);
    pickNextTarget();
  };

  const endGame = () => {
    setIsPlaying(false);
    saveHighScore(score);
    setCurrentTarget(null);
    Alert.alert("Time's Up!", `You scored ${score} points!`, [
      { text: "Play Again", onPress: startGame },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickNextTarget = () => {
    const randomLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    setCurrentTarget(randomLoc);
    setSelectedId(null);
    setFeedback(null);
  };

  const handleTap = (locId: string) => {
    if (!isPlaying || feedback !== null) return;

    setSelectedId(locId);

    if (locId === currentTarget.id) {
      setScore(score + 10); // +10 for correct
      setFeedback("correct");
      setTimeout(() => {
        pickNextTarget();
      }, 800); // give time to see green flash
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        pickNextTarget();
      }, 1500); // more time to see the yellow correct answer
    }
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
          {isPlaying && currentTarget ? (
            <>
              <Text style={[styles.findText, { color: COLORS.sub }]}>Locate:</Text>
              <Text style={[styles.targetText, { color: COLORS.text }]}>{currentTarget.name}</Text>
            </>
          ) : (
            <Text style={[styles.targetText, { color: COLORS.text, fontSize: 24, marginTop: 10 }]}>Ready to identify States?</Text>
          )}
        </View>

        {/* Game Map Area */}
        <View style={styles.mapContainer}>
          <View style={styles.mapWrapper}>
            <IndiaMapSvg
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              isDark={isDark}
              selectedId={selectedId}
              targetId={currentTarget?.id}
              feedback={feedback}
              onLocationPress={handleTap}
            />
          </View>
        </View>

        {/* Controls */}
        {!isPlaying && (
          <TouchableOpacity style={[styles.startBtn, { backgroundColor: COLORS.accent }]} onPress={startGame}>
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.startBtnText}>Start Game (60s)</Text>
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
    alignItems: "center",
    justifyContent: "center",
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
