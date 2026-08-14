import SafeContainer from '../components/SafeContainer';
// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { auth } from "../firebaseConfig";
import { useAuth } from "../hooks/useAuth";
import { useProgress } from "../hooks/useProgress";
import { updateProfile } from "../services/userService";
import { getNotificationPreferences, updateNotificationPreferences } from "../services/notificationService";
import { getEntitlements } from "../services/subscriptionService";
import type { PreparationLevel, UserEntitlementsDto, UpdateProfileRequestDto } from "@aarambh360/types";

// Enable animation for Android


export default function ProfileScreen({ navigation }: any) {
  const { profile, loading: authLoading, refreshProfile } = useAuth();
  const { streaks, stats } = useProgress();
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const [entitlements, setEntitlements] = useState<UserEntitlementsDto | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<any>({});

  const mcqStreak = streaks.find((item) => item.streakType === "MCQ");
  const streak = mcqStreak?.currentCount ?? 0;
  const quizzesTaken = stats?.totalQuestionsAnswered ?? 0;
  const accuracyRate = stats?.accuracy ?? 0;
  const userData = profile?.profile;
  const loading = authLoading;
  const isDark = useColorScheme() === "dark";

  const COLORS = {
    bg: isDark
      ? (["#0b1220", "#111b2e"] as [string, string])
      : (["#eaf2ff", "#ffffff"] as [string, string]),

    card: isDark
      ? "rgba(255,255,255,0.05)"
      : "rgba(0,0,0,0.05)",

    border: isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.12)",

    text: isDark ? "#e2e8f0" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",

    accent: isDark ? "#06b6d4" : "#0284c7",
  };

  const refreshData = async () => {
    try {
      const [entDetails, prefs] = await Promise.all([
        getEntitlements(),
        getNotificationPreferences()
      ]);
      setEntitlements(entDetails);
      setNotifPrefs(prefs);
    } catch (err) {
      console.warn("Failed to load profile dependencies (possibly not deployed to Render yet):", err);
    }
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = navigation.addListener("focus", () => {
      refreshData();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (profile?.profile) {
      setForm(profile.profile);
    }
  }, [profile]);

  const saveProfile = async () => {
    try {
      const targetYearNum = form.targetYear ? parseInt(form.targetYear, 10) : undefined;
      const dailyStudyMinutesNum = form.dailyStudyMinutes ? parseInt(form.dailyStudyMinutes, 10) : undefined;

      const profilePayload: UpdateProfileRequestDto = {
        name: form.name || undefined,
        targetYear: (targetYearNum === undefined || isNaN(targetYearNum)) ? undefined : targetYearNum,
        preparationLevel: form.preparationLevel as PreparationLevel,
        dailyStudyMinutes: (dailyStudyMinutesNum === undefined || isNaN(dailyStudyMinutesNum)) ? undefined : dailyStudyMinutesNum,
        bio: form.bio || undefined,
      };

      const notifPayload = {
        pushNotifications: !!notifPrefs.pushNotifications,
        streakReminders: !!notifPrefs.streakReminders,
        mainsEvalAlerts: !!notifPrefs.mainsEvalAlerts,
        quizReminders: !!notifPrefs.quizReminders,
        currentAffairsAlerts: !!notifPrefs.currentAffairsAlerts,
      };

      await Promise.all([
        updateProfile(profilePayload),
        updateNotificationPreferences(notifPayload),
      ]);

      await refreshProfile();
      await refreshData();
      setEditModal(false);
      Alert.alert("Success", "Profile and preferences updated successfully.");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const openEdit = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setForm(userData || {});
    setEditModal(true);
  };

  if (loading || !userData) {
    return (
      <LinearGradient colors={COLORS.bg} style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={[styles.loadingText, { color: COLORS.sub }]}>
          Loading profile…
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.bg} style={{ flex: 1 }}>
      <SafeContainer style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* GLASS HEADER (Fixed for Android touch) */}
          <View style={[styles.header, { backgroundColor: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)' }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={24} color={COLORS.accent} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: COLORS.text }]}>Profile</Text>

            <Ionicons name="settings-outline" size={24} color={COLORS.accent} />
          </View>

          {/* PROFILE SECTION */}
          <View style={styles.profileSection}>
            <Image
              source={{ uri: userData.avatarUrl || "https://i.ibb.co/4pDNDk1/avatar.png" }}
              style={styles.avatar}
            />

            <Text style={[styles.name, { color: COLORS.text }]}>{userData.name}</Text>
            <Text style={[styles.email, { color: COLORS.sub }]}>
              {profile?.user.email}
            </Text>
          </View>

          {/* STATS ROW */}
          <View style={styles.statsRow}>
            <View style={[styles.statsCard, { backgroundColor: COLORS.card }]}>
              <Ionicons name="book-outline" size={22} color={COLORS.accent} />
              <Text style={[styles.statsValue, { color: COLORS.text }]}>{quizzesTaken}</Text>
              <Text style={[styles.statsLabel, { color: COLORS.sub }]}>Quizzes</Text>
            </View>

            <View style={[styles.statsCard, { backgroundColor: COLORS.card }]}>
              <Ionicons name="stats-chart-outline" size={22} color="#10B981" />
              <Text style={[styles.statsValue, { color: "#10B981" }]}>{accuracyRate}%</Text>
              <Text style={[styles.statsLabel, { color: COLORS.sub }]}>Accuracy</Text>
            </View>

            <View style={[styles.statsCard, { backgroundColor: COLORS.card }]}>
              <Ionicons name="flame" size={24} color="#F59E0B" />
              <Text style={[styles.statsValue, { color: "#F59E0B" }]}>{streak}</Text>
              <Text style={[styles.statsLabel, { color: COLORS.sub }]}>Streak</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.upgradeBtn, { borderColor: COLORS.accent }]}
            onPress={() => navigation.navigate("SubscriptionScreen")}
          >
            <Text style={[styles.upgradeText, { color: COLORS.accent }]}>Manage Subscription</Text>
          </TouchableOpacity>

          {entitlements && (
            <View style={[styles.entitlementsCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
              <Text style={[styles.entitlementsTitle, { color: COLORS.text }]}>
                Current Plan: {entitlements.planName}
              </Text>
              <Text style={[styles.entitlementsExpiry, { color: COLORS.sub }]}>
                Status: {entitlements.subscriptionStatus}
                {entitlements.expiresAt ? ` • Expires: ${new Date(entitlements.expiresAt).toLocaleDateString()}` : ""}
              </Text>
              <View style={[styles.separator, { backgroundColor: COLORS.border }]} />
              {entitlements.features?.map((feature: any) => (
                <View key={feature.code} style={styles.featureRow}>
                  <Text style={[styles.featureText, { color: COLORS.text }]}>
                    {feature.code === "MAINS_EVAL" ? "Mains AI Evaluation Quota" : feature.code}
                  </Text>
                  <Text style={[styles.featureValue, { color: COLORS.accent }]}>
                    {feature.unlimited ? "Unlimited" : `${feature.remaining ?? 0} remaining`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* INFO CARDS */}
          <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>
            Preparation Details
          </Text>

          {[
            { label: "Target Year", value: userData.targetYear?.toString() },
            { label: "Preparation Level", value: userData.preparationLevel },
            { label: "Daily Study Minutes", value: userData.dailyStudyMinutes?.toString() },
            { label: "Bio", value: userData.bio },
          ].map((item, i) => (
            <View
              key={i}
              style={[
                styles.infoCard,
                {
                  backgroundColor: COLORS.card,
                  borderColor: COLORS.border,
                },
              ]}
            >
              <Text style={[styles.infoLabel, { color: COLORS.sub }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>
                {item.value ?? "-"}
              </Text>
            </View>
          ))}

          {/* BUTTON ROW */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, { borderColor: COLORS.accent }]}
              onPress={openEdit}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.accent} />
              <Text style={[styles.btnText, { color: COLORS.accent }]}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={async () => {
              await auth.signOut();
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }}
          >
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <View style={{ height: 160 }} />

        </ScrollView>

        {/* EDIT MODAL */}
        <Modal transparent visible={editModal} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={[styles.modalBox, { backgroundColor: isDark ? "#0f172a" : "#ffffff", maxHeight: "85%" }]}>
              <Text style={[styles.modalTitle, { color: COLORS.text, marginBottom: 15 }]}>
                Edit Profile
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Name */}
                <Text style={[styles.fieldLabel, { color: COLORS.sub }]}>Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: COLORS.card,
                      color: COLORS.text,
                      borderColor: COLORS.border,
                    },
                  ]}
                  placeholder="Name"
                  placeholderTextColor={COLORS.sub}
                  value={form.name || ""}
                  onChangeText={(v) => setForm({ ...form, name: v })}
                />

                {/* Target Year */}
                <Text style={[styles.fieldLabel, { color: COLORS.sub, marginTop: 12 }]}>Target Year</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: COLORS.card,
                      color: COLORS.text,
                      borderColor: COLORS.border,
                    },
                  ]}
                  placeholder="Target Year (e.g. 2026)"
                  placeholderTextColor={COLORS.sub}
                  keyboardType="numeric"
                  value={form.targetYear?.toString() || ""}
                  onChangeText={(v) => setForm({ ...form, targetYear: v })}
                />

                {/* Preparation Level */}
                <Text style={[styles.fieldLabel, { color: COLORS.sub, marginTop: 12, marginBottom: 6 }]}>Preparation Level</Text>
                <View style={styles.pickerRow}>
                  {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.pickerBtn,
                        { borderColor: COLORS.border },
                        form.preparationLevel === level && { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
                      ]}
                      onPress={() => setForm({ ...form, preparationLevel: level })}
                    >
                      <Text
                        style={[
                          styles.pickerBtnText,
                          { color: form.preparationLevel === level ? "#fff" : COLORS.text },
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Daily Study Minutes */}
                <Text style={[styles.fieldLabel, { color: COLORS.sub, marginTop: 12 }]}>Daily Study Minutes</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: COLORS.card,
                      color: COLORS.text,
                      borderColor: COLORS.border,
                    },
                  ]}
                  placeholder="Daily Study Minutes (e.g. 120)"
                  placeholderTextColor={COLORS.sub}
                  keyboardType="numeric"
                  value={form.dailyStudyMinutes?.toString() || ""}
                  onChangeText={(v) => setForm({ ...form, dailyStudyMinutes: v })}
                />

                {/* Bio */}
                <Text style={[styles.fieldLabel, { color: COLORS.sub, marginTop: 12 }]}>Bio</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: COLORS.card,
                      color: COLORS.text,
                      borderColor: COLORS.border,
                      height: 80,
                      textAlignVertical: "top",
                    },
                  ]}
                  placeholder="Tell us about yourself…"
                  placeholderTextColor={COLORS.sub}
                  multiline
                  numberOfLines={3}
                  value={form.bio || ""}
                  onChangeText={(v) => setForm({ ...form, bio: v })}
                />

                {/* Notification Preferences */}
                <Text style={[styles.fieldLabel, { color: COLORS.accent, marginTop: 20, fontWeight: "700" }]}>
                  Notification Preferences
                </Text>
                <View style={[styles.separator, { backgroundColor: COLORS.border }]} />

                {[
                  { key: "pushNotifications", label: "Push Notifications" },
                  { key: "streakReminders", label: "Streak Reminders" },
                  { key: "mainsEvalAlerts", label: "Mains Evaluation Alerts" },
                  { key: "quizReminders", label: "Quiz Reminders" },
                  { key: "currentAffairsAlerts", label: "Current Affairs Alerts" },
                ].map((item) => (
                  <View key={item.key} style={styles.switchRow}>
                    <Text style={[styles.switchLabel, { color: COLORS.text }]}>{item.label}</Text>
                    <Switch
                      value={!!notifPrefs[item.key]}
                      onValueChange={(val) => setNotifPrefs({ ...notifPrefs, [item.key]: val })}
                      trackColor={{ false: "#767577", true: COLORS.accent }}
                      thumbColor={notifPrefs[item.key] ? "#ffffff" : "#f4f3f4"}
                    />
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.accent }]} onPress={saveProfile}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Text style={{ color: COLORS.sub, textAlign: "center", marginTop: 10 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.6,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", flex: 1, textAlign: "center" },

  profileSection: { alignItems: "center", marginTop: 20 },
  avatar: {
    width: 115,
    height: 115,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: "#06b6d4",
  },
  name: { marginTop: 10, fontSize: 22, fontWeight: "800" },
  email: { fontSize: 14, marginTop: 4 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 25,
  },
  statsCard: {
    width: "30%",
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 14,
  },
  statsValue: { marginTop: 6, fontSize: 17, fontWeight: "700" },
  statsLabel: { marginTop: 4, fontSize: 12 },

  upgradeBtn: {
    marginHorizontal: 16,
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  upgradeText: { fontWeight: "800", fontSize: 15 },

  sectionTitle: { marginLeft: 16, marginTop: 28, fontWeight: "700", fontSize: 16 },

  infoCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 15, marginTop: 4, fontWeight: "700" },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 28,
  },
  btn: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  btnText: { marginLeft: 6, fontWeight: "700" },

  logoutBtn: { flexDirection: "row", alignSelf: "center", marginTop: 30 },
  logoutText: { marginLeft: 6, color: "#ef4444", fontSize: 16, fontWeight: "700" },

  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },

  modalBox: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },

  input: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },

  saveBtn: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },

  entitlementsCard: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  entitlementsTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  entitlementsExpiry: {
    fontSize: 12,
    marginTop: 4,
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  featureText: {
    fontSize: 14,
    fontWeight: "500",
  },
  featureValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  pickerBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  pickerBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
});
