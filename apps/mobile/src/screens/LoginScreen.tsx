import SafeContainer from '../components/SafeContainer';
// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from "react";
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

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // THEME COLORS (same as other Aarambh screens)
  const BG = isDark ? "#0b1220" : "#ffffff";
  const CARD = isDark ? "#0f172a" : "#f1f5f9";
  const INPUT_BG = isDark ? "#071022" : "#e2e8f0";
  const TEXT = isDark ? "#ffffff" : "#0f172a";
  const SUBTEXT = isDark ? "#94a3b8" : "#475569";
  const FOOTER = isDark ? "#64748b" : "#475569";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [restoringSession, setRestoringSession] = useState(true);

  // Redirect if already logged in
  useEffect(() => {
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
          // If the backend fails (e.g. timeout or 500), sign out of Firebase so they aren't stuck
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
      <View style={[styles.container, { backgroundColor: BG, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={{ color: TEXT, marginTop: 16, fontSize: 16, fontWeight: "600" }}>Check Session</Text>
      </View>
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
      // Try login
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCred.user.getIdToken();
      const profile = await loginWithFirebaseToken(token);

      if (profile.user.profileCompleted) {
        navigation.replace("ExamHomeScreen", { exam: "UPSC" });
      } else {
        navigation.replace("Signup");
      }
    } catch (err: any) {
      // Firebase 2024+ sometimes throws invalid-credential instead of user-not-found
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        try {
          console.log("Attempting signup for new user...");
          const newUser = await createUserWithEmailAndPassword(auth, email, password);
          const token = await newUser.user.getIdToken();
          await loginWithFirebaseToken(token);
          navigation.replace("Signup");
        } catch (signupErr: any) {
          console.error("Signup Error:", signupErr);
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
        console.error("Login Error:", err);
        if (Platform.OS === 'web') alert(`Login Error: ${err.message}`);
        else Alert.alert("Login Error", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: BG }]}
    >
      <View style={[styles.card, { backgroundColor: CARD }]}>
        <Text style={[styles.title, { color: TEXT }]}>Welcome to Aarambh360</Text>
        <Text style={[styles.subtitle, { color: SUBTEXT }]}>
          Your UPSC Journey Starts Here
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: INPUT_BG, color: TEXT }]}
          placeholder="Email Address"
          placeholderTextColor={SUBTEXT}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[styles.input, { backgroundColor: INPUT_BG, color: TEXT }]}
          placeholder="Password"
          placeholderTextColor={SUBTEXT}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#012028" />
          ) : (
            <Text style={styles.btnText}>Login / Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Alert.alert("Coming Soon", "Password recovery feature coming soon!")
          }
        >
          <Text style={[styles.forgotText, { color: "#38bdf8" }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.footer, { color: FOOTER }]}>
        © Aarambh360 • Empowering UPSC Aspirants Since 2025
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    padding: 26,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 26,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#06b6d4",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnText: {
    color: "#012028",
    fontWeight: "700",
    fontSize: 16,
  },
  forgotText: {
    textAlign: "center",
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    fontSize: 12,
    marginTop: 28,
    textAlign: "center",
  },
});
