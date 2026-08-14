import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import SafeContainer from "../components/SafeContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "1",
    title: "Admin: Welcome to Aarambh360!",
    message: "Thank you for joining. Complete your first Daily MCQ to start your streak.",
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: "2",
    title: "Admin: New Test Series Available",
    message: "The 2026 Prelims Mock Test 1 is now live in the Test Series Hub. Good luck!",
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: false,
  }
];

export default function NotificationScreen({ navigation }: any) {
  const isDark = useColorScheme() === "dark";
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const COLORS = {
    bg: (isDark ? ["#0f172a", "#1e293b"] : ["#f8fafc", "#f1f5f9"]) as readonly [string, string, ...string[]],
    card: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#64748b",
    accent: "#06b6d4",
    border: isDark ? "#334155" : "#e2e8f0",
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem("@app_notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem("@app_notifications", JSON.stringify(DEFAULT_NOTIFICATIONS));
        setNotifications(DEFAULT_NOTIFICATIONS);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const dismissNotification = async (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    await AsyncStorage.setItem("@app_notifications", JSON.stringify(updated));
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {notifications.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="notifications-off-outline" size={48} color={COLORS.sub} />
              <Text style={[styles.emptyText, { color: COLORS.sub }]}>No new notifications</Text>
            </View>
          ) : (
            notifications.map((notif) => (
              <View key={notif.id} style={[styles.notifCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
                <View style={styles.notifHeader}>
                  <View style={styles.adminBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#fff" />
                    <Text style={styles.adminText}>ADMIN</Text>
                  </View>
                  <Text style={[styles.dateText, { color: COLORS.sub }]}>{formatDate(notif.date)}</Text>
                </View>
                <Text style={[styles.notifTitle, { color: COLORS.text }]}>{notif.title}</Text>
                <Text style={[styles.notifMessage, { color: COLORS.sub }]}>{notif.message}</Text>
                
                <TouchableOpacity 
                  style={[styles.dismissBtn, { backgroundColor: COLORS.bg[0] }]}
                  onPress={() => dismissNotification(notif.id)}
                >
                  <Text style={[styles.dismissText, { color: COLORS.accent }]}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
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
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  scrollContent: { padding: 16 },
  notifCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  notifHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#06b6d4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminText: { color: "#fff", fontSize: 10, fontWeight: "800", marginLeft: 4 },
  dateText: { fontSize: 11 },
  notifTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  notifMessage: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  dismissBtn: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  dismissText: { fontWeight: "700", fontSize: 13 },
  emptyBox: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 12, fontSize: 15, fontWeight: "600" },
});
