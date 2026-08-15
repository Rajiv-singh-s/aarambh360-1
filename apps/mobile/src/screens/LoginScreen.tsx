import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useColorScheme,
  Animated,
  Easing,
  Dimensions
} from "react-native";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { loginWithFirebaseToken } from "../services/authService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const isDark = useColorScheme() === "dark";

  // Ultra-Premium Theme Colors
  const COLORS = {
    bg: (isDark ? ["#020617", "#0f172a"] : ["#f8fafc", "#e2e8f0"]) as [string, string],
    card: isDark ? "rgba(30,41,59,0.7)" : "rgba(255,255,255,0.7)",
    accent: isDark ? "#0ea5e9" : "#0284c7",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    inputBg: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)",
    glassBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [restoringSession, setRestoringSession] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.exp), useNativeDriver: true })
    ]).start();

    // Background Orb Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();

    // Auth Session Restore
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const profile = await loginWithFirebaseToken(token);
          if (profile.user.profileCompleted) {
            navigation.replace("ExamHomeScreen", { exam: "UPSC" });
          } else {
            navigation.replace("Signup");
          }
        } catch (err: any) {
          console.error("Session restore error:", err);
          auth.signOut();
          setRestoringSession(false);
        }
      } else {
        setRestoringSession(false);
      }
    });
    return unsubscribe;
  }, [navigation]);

  if (restoringSession) {
    return (
      <LinearGradient colors={COLORS.bg} style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{ color: COLORS.text, marginTop: 16, fontSize: 16, fontWeight: "600" }}>Securing connection...</Text>
      </LinearGradient>
    );
  }

  const handleAuth = async () => {
    if (!email.includes("@") || password.length < 6) {
      if (Platform.OS === 'web') alert("Enter a valid email & password (6+ chars)");
      else Alert.alert("Invalid Input", "Enter a valid email & password (6+ chars)");
      return;
    }

    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCred.user.getIdToken();
      const profile = await loginWithFirebaseToken(token);

      if (profile.user.profileCompleted) {
        navigation.replace("ExamHomeScreen", { exam: "UPSC" });
      } else {
        navigation.replace("Signup");
      }
    } catch (err: any) {
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        try {
          const newUser = await createUserWithEmailAndPassword(auth, email, password);
          const token = await newUser.user.getIdToken();
          await loginWithFirebaseToken(token);
          navigation.replace("Signup");
        } catch (signupErr: any) {
          if (Platform.OS === 'web') alert(`Signup Error: ${signupErr.message}`);
          else Alert.alert("Signup Error", signupErr.message);
        }
      } else if (err.code === "auth/wrong-password") {
        if (Platform.OS === 'web') alert("Incorrect Password");
        else Alert.alert("Incorrect Password", "Please check your password and try again.");
      } else if (err.code === "auth/invalid-email") {
        if (Platform.OS === 'web') alert("Invalid Email");
        else Alert.alert("Invalid Email", "Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        if (Platform.OS === 'web') alert("Too Many Attempts");
        else Alert.alert("Too Many Attempts", "Please try again later.");
      } else {
        if (Platform.OS === 'web') alert(`Login Error: ${err.message}`);
        else Alert.alert("Login Error", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={COLORS.bg} style={styles.container}>
      {/* Background Glowing Orbs */}
      <Animated.View style={[styles.orb, { backgroundColor: "#0ea5e9", top: -100, left: -50, transform: [{ scale: pulseAnim }] }]} />
      <Animated.View style={[styles.orb, { backgroundColor: "#f59e0b", bottom: -100, right: -50, opacity: 0.15, transform: [{ scale: pulseAnim }] }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.cardContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="book" size={32} color="#ffffff" />
            </View>
            <Text style={[styles.title, { color: COLORS.text }]}>Aarambh360</Text>
            <Text style={[styles.subtitle, { color: COLORS.sub }]}>Conquer your UPSC Journey</Text>
          </View>

          <BlurView intensity={isDark ? 30 : 60} tint={isDark ? "dark" : "light"} style={[styles.glassCard, { borderColor: COLORS.glassBorder }]}>
            
            <View style={[styles.inputContainer, { backgroundColor: COLORS.inputBg, borderColor: COLORS.glassBorder }]}>
              <Ionicons name="mail-outline" size={20} color={COLORS.sub} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: COLORS.text }]}
                placeholder="Email Address"
                placeholderTextColor={COLORS.sub}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: COLORS.inputBg, borderColor: COLORS.glassBorder }]}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.sub} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: COLORS.text }]}
                placeholder="Password"
                placeholderTextColor={COLORS.sub}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.7 }]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#0ea5e9", "#0284c7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.btnText}>Login / Sign Up</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => Alert.alert("Coming Soon", "Password recovery feature coming soon!")}
            >
              <Text style={[styles.forgotText, { color: COLORS.accent }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        <Text style={[styles.footer, { color: COLORS.sub }]}>
          © Aarambh360 • Empowering UPSC Aspirants Since 2025
        </Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orb: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.2,
  },
  keyboardView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  glassCard: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    height: "100%",
  },
  btn: {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnGradient: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  forgotBtn: {
    marginTop: 20,
    alignItems: "center",
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
