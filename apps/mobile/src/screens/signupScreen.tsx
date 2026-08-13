// src/screens/signupScreen.tsx
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { auth } from "../firebaseConfig";
import { useAuth } from "../hooks/useAuth";
import { updateProfile } from "../services/userService";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Signup"
>;

export default function SignupScreen() {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);

  // Basic validation
  const validateInputs = () => {
    if (!name.trim()) return "Full name is required.";
    if (!/^\d{10}$/.test(phone)) return "Enter a valid 10-digit phone number.";
    if (!dob.match(/^\d{2}\/\d{2}\/\d{4}$/))
      return "Date of Birth must be in DD/MM/YYYY format.";
    if (!["male", "female", "other"].includes(gender.toLowerCase()))
      return "Gender must be Male, Female, or Other.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateInputs();
    if (validationError) {
      Alert.alert("Invalid Details", validationError);
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const [day, month, year] = dob.split("/");
        await updateProfile({
          name: name.trim(),
          gender: gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase(),
          dateOfBirth: `${year}-${month}-${day}`,
          profileCompleted: true,
        });
        await refreshProfile();

        Alert.alert("🎉 Profile Saved", `Welcome aboard, ${name}!`);
        navigation.replace("MainHomeScreen");
      } else {
        Alert.alert("Session Expired", "Please log in again.");
        navigation.replace("Login");
      }
    } catch (error: any) {
      console.error("Profile Save Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Help us personalize your UPSC learning journey ✨
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#94a3b8"
          value={name}
          autoCapitalize="words"
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={10}
        />

        <TextInput
          style={styles.input}
          placeholder="Date of Birth (DD/MM/YYYY)"
          placeholderTextColor="#94a3b8"
          value={dob}
          onChangeText={setDob}
        />

        <TextInput
          style={styles.input}
          placeholder="Gender (Male/Female/Other)"
          placeholderTextColor="#94a3b8"
          value={gender}
          onChangeText={setGender}
          autoCapitalize="words"
        />

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#012028" />
          ) : (
            <Text style={styles.btnText}>Submit</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace("Login")}>
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 24,
    fontSize: 14,
  },
  input: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#071022",
    color: "#fff",
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
    marginTop: 10,
  },
  btnText: {
    color: "#012028",
    fontWeight: "700",
    fontSize: 16,
  },
  backText: {
    color: "#7dd3fc",
    textAlign: "center",
    marginTop: 18,
    fontSize: 14,
    fontWeight: "600",
  },
});
