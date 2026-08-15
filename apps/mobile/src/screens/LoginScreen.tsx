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
  Dimensions,
  Image
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
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from "react-native-svg";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const { width, height } = Dimensions.get("window");

// Floating Particle Component
const FloatingParticle = ({ delay, size, startX, speed }: { delay: number, size: number, startX: number, speed: number }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: -100, duration: speed, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.6, duration: speed * 0.2, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.6, duration: speed * 0.6, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: speed * 0.2, useNativeDriver: true }),
          ])
        ])
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: startX,
        bottom: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#0ea5e9",
        opacity: opacity,
        transform: [{ translateY }],
        shadowColor: "#0ea5e9",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
      }}
    />
  );
};

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
  const slideAnim = useRef(new Animated.Value(50)).current;
  const input1Anim = useRef(new Animated.Value(50)).current;
  const input2Anim = useRef(new Animated.Value(50)).current;
  const btnAnim = useRef(new Animated.Value(50)).current;
  
  const orb1X = useRef(new Animated.Value(-50)).current;
  const orb1Y = useRef(new Animated.Value(-100)).current;
  const orb2X = useRef(new Animated.Value(width)).current;
  const orb2Y = useRef(new Animated.Value(height)).current;
  
  const ripple1 = useRef(new Animated.Value(1)).current;
  const ripple1Opacity = useRef(new Animated.Value(0.5)).current;
  const ripple2 = useRef(new Animated.Value(1)).current;
  const ripple2Opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Staggered Entrance Animation
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.exp), useNativeDriver: true })
      ]),
      Animated.timing(input1Anim, { toValue: 0, duration: 600, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      Animated.timing(input2Anim, { toValue: 0, duration: 600, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      Animated.timing(btnAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.exp), useNativeDriver: true }),
    ]).start();

    // Floating Orbs Figure-8 Animation
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(orb1X, { toValue: width / 2, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(orb1X, { toValue: -50, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(orb1Y, { toValue: 200, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(orb1Y, { toValue: -100, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(orb2X, { toValue: -100, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(orb2X, { toValue: width, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(orb2Y, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(orb2Y, { toValue: height, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ])
    ).start();

    // Infinite Ripple Effect behind Logo
    const createRipple = (scale: Animated.Value, opacity: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, { toValue: 2.5, duration: 3000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 3000, easing: Easing.out(Easing.quad), useNativeDriver: true })
          ]),
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    };

    createRipple(ripple1, ripple1Opacity, 0);
    createRipple(ripple2, ripple2Opacity, 1500);

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
      <LinearGradient colors={COLORS.bg} style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
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
      {/* Background Animated Orbs */}
      <Animated.View style={[styles.orb, { backgroundColor: "#0ea5e9", transform: [{ translateX: orb1X }, { translateY: orb1Y }] }]} />
      <Animated.View style={[styles.orb, { backgroundColor: "#f59e0b", opacity: 0.25, transform: [{ translateX: orb2X }, { translateY: orb2Y }] }]} />

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <FloatingParticle
          key={i}
          delay={Math.random() * 5000}
          size={Math.random() * 10 + 5}
          startX={Math.random() * width}
          speed={Math.random() * 5000 + 5000}
        />
      ))}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.cardContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          <View style={styles.logoContainer}>
            {/* Animated Ripples */}
            <Animated.View style={[styles.ripple, { transform: [{ scale: ripple1 }], opacity: ripple1Opacity }]} />
            <Animated.View style={[styles.ripple, { transform: [{ scale: ripple2 }], opacity: ripple2Opacity }]} />
            
            <View style={styles.logoCircle}>
              <Ionicons name="school" size={36} color="#ffffff" />
            </View>
            <Text style={[styles.title, { color: COLORS.text }]}>Aarambh360</Text>
            <Text style={[styles.subtitle, { color: COLORS.sub }]}>Conquer your UPSC Journey</Text>
          </View>

          <BlurView intensity={isDark ? 30 : 60} tint={isDark ? "dark" : "light"} style={[styles.glassCard, { borderColor: COLORS.glassBorder }]}>
            
            <Animated.View style={[styles.inputContainer, { backgroundColor: COLORS.inputBg, borderColor: COLORS.glassBorder, transform: [{ translateY: input1Anim }] }]}>
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
            </Animated.View>

            <Animated.View style={[styles.inputContainer, { backgroundColor: COLORS.inputBg, borderColor: COLORS.glassBorder, transform: [{ translateY: input2Anim }] }]}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.sub} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: COLORS.text }]}
                placeholder="Password"
                placeholderTextColor={COLORS.sub}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </Animated.View>

            <Animated.View style={{ transform: [{ translateY: btnAnim }] }}>
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
            </Animated.View>

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
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.3,
    filter: [{ blur: 40 }], // Web/Newer React Native support for CSS blur
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
    marginBottom: 40,
    position: "relative",
  },
  ripple: {
    position: "absolute",
    top: -12,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#0ea5e9",
    zIndex: -1,
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
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  glassCard: {
    width: "100%",
    borderRadius: 28,
    padding: 28,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 18,
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
    marginTop: 12,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnGradient: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 1,
  },
  forgotBtn: {
    marginTop: 24,
    alignItems: "center",
  },
  forgotText: {
    fontSize: 15,
    fontWeight: "800",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});
