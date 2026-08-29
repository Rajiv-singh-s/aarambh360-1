import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";
import Svg, { Circle } from "react-native-svg";
import { Audio } from "expo-av";

const { width } = Dimensions.get("window");
const SIZE = width * 0.7;
const STROKE_WIDTH = 15;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

export default function StudyRoomScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";

  // State
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [lofiEnabled, setLofiEnabled] = useState(false); // Default to false to prevent autoplay issues
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Constants
  const totalTime = mode === "focus" ? 25 * 60 : 5 * 60;
  const progress = timeLeft / totalTime;
  const strokeDashoffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f0ff", "#ffffff"] as [string, string]),
    cardBg: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    accent: mode === "focus" ? "#06b6d4" : "#10b981", // Teal for focus, Green for break
    accentBg: mode === "focus" ? "rgba(6,182,212,0.15)" : "rgba(16,185,129,0.15)",
  };

  // Audio Setup
  useEffect(() => {
    let currentSound: Audio.Sound | null = null;
    const loadAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }, // reliable placeholder lofi track
          { isLooping: true, volume: 0.5 }
        );
        currentSound = newSound;
        setSound(newSound);
        
        if (lofiEnabled) {
          await newSound.playAsync();
        }
      } catch (e) {
        console.log("Audio Load Error:", e);
      }
    };

    loadAudio();

    return () => {
      if (currentSound) {
        currentSound.stopAsync();
        currentSound.unloadAsync();
      }
    };
  }, []);

  // Audio Play/Pause Sync
  useEffect(() => {
    if (sound) {
      if (lofiEnabled) {
        sound.playAsync();
      } else {
        sound.pauseAsync();
      }
    }
  }, [lofiEnabled, sound]);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Auto-switch mode
      if (mode === "focus") {
        setMode("break");
        setTimeLeft(5 * 60);
      } else {
        setMode("focus");
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: "focus" | "break") => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === "focus" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Study Room</Text>
          <TouchableOpacity onPress={() => setLofiEnabled(!lofiEnabled)} style={styles.backBtn}>
            <Ionicons name={lofiEnabled ? "musical-notes" : "musical-notes-outline"} size={24} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

        {/* Live Stats */}
        <View style={styles.liveBox}>
          <View style={styles.pulseDot} />
          <Text style={[styles.liveText, { color: COLORS.sub }]}>4,291 Aspirants Studying Now</Text>
        </View>

        {/* Timer UI */}
        <View style={styles.timerContainer}>
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, mode === "focus" && { backgroundColor: COLORS.accent }]}
              onPress={() => switchMode("focus")}
            >
              <Text style={[styles.modeText, mode === "focus" && { color: "#fff" }]}>Pomodoro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === "break" && { backgroundColor: COLORS.accent }]}
              onPress={() => switchMode("break")}
            >
              <Text style={[styles.modeText, mode === "break" && { color: "#fff" }]}>Short Break</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.circleWrapper}>
            <Svg width={SIZE} height={SIZE}>
              {/* Background Circle */}
              <Circle
                stroke={COLORS.border}
                fill="none"
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE_WIDTH}
              />
              {/* Progress Circle */}
              <Circle
                stroke={COLORS.accent}
                fill="none"
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              />
            </Svg>

            <View style={styles.timeTextContainer}>
              <Text style={[styles.timeText, { color: COLORS.text }]}>{formatTime(timeLeft)}</Text>
              <Text style={[styles.modeLabel, { color: COLORS.accent }]}>
                {mode === "focus" ? "FOCUS" : "BREAK"}
              </Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlBtn} onPress={resetTimer}>
              <Ionicons name="refresh" size={28} color={COLORS.sub} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playBtn, { backgroundColor: COLORS.accent }]}
              onPress={toggleTimer}
            >
              <Ionicons name={isActive ? "pause" : "play"} size={36} color="#fff" style={{ marginLeft: isActive ? 0 : 4 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn}>
              <Ionicons name="settings-outline" size={26} color={COLORS.sub} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Lo-Fi Banner */}
        <View style={[styles.lofiBanner, { backgroundColor: COLORS.cardBg, borderColor: COLORS.border }]}>
          <View style={[styles.lofiIconBox, { backgroundColor: COLORS.accentBg }]}>
            <Ionicons name="headset" size={24} color={COLORS.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.lofiTitle, { color: COLORS.text }]}>Ambient Study Beats</Text>
            <Text style={[styles.lofiSub, { color: COLORS.sub }]}>{lofiEnabled ? "Playing • Lofi Girl Radio" : "Paused"}</Text>
          </View>
          <TouchableOpacity onPress={() => setLofiEnabled(!lofiEnabled)}>
            <Ionicons name={lofiEnabled ? "pause-circle" : "play-circle"} size={40} color={COLORS.accent} />
          </TouchableOpacity>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backBtn: { padding: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  liveBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    marginRight: 8,
  },
  liveText: {
    fontSize: 13,
    fontWeight: "600",
  },
  timerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "rgba(150,150,150,0.1)",
    borderRadius: 20,
    padding: 4,
    marginBottom: 40,
  },
  modeTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  modeText: {
    fontWeight: "700",
    color: "#94a3b8",
  },
  circleWrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  timeTextContainer: {
    position: "absolute",
    alignItems: "center",
  },
  timeText: {
    fontSize: 56,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: -4,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    gap: 30,
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(150,150,150,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  lofiBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  lofiIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  lofiTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  lofiSub: {
    fontSize: 13,
    marginTop: 2,
  },
});
