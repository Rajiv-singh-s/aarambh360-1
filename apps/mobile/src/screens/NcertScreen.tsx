// src/screens/NcertScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { BlurView } from "expo-blur";
import { useNcert } from "../hooks/useContent";

const { height } = Dimensions.get("window");

export default function NcertScreen() {
  const { data: books, loading } = useNcert();

  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";

  /* THEME */
  const COLORS = {
    bg: (
      isDark
        ? ["#0b1220", "#111b2e"]
        : ["#e8f0ff", "#ffffff"]
    ) as [string, string],

    card: isDark
      ? "rgba(255,255,255,0.05)"
      : "rgba(0,0,0,0.05)",

    border: isDark
      ? "rgba(255,255,255,0.1)"
      : "rgba(0,0,0,0.15)",

    accent: isDark ? "#06b6d4" : "#0284c7",

    text: isDark ? "#e2e8f0" : "#1e293b",
    sub: isDark ? "#94a3b8" : "#475569",

    cardText: isDark ? "#f1f5f9" : "#0f172a",
    cardSub: isDark ? "#cbd5e1" : "#64748b",
  };

  /* LOADING SCREEN */
  if (loading) {
    return (
      <LinearGradient colors={COLORS.bg} style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={[styles.loading, { color: COLORS.sub }]}>
          Loading NCERT Resources...
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.bg} style={styles.background}>
      {/* HEADER */}
      <BlurView
        intensity={40}
        tint={isDark ? "dark" : "light"}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.accent} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: COLORS.accent }]}>
            NCERT Books
          </Text>

          <View style={{ width: 40 }} />
        </View>
      </BlurView>

      {/* MAIN CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View
          style={[
            styles.contentBox,
            {
              backgroundColor: COLORS.card,
              borderColor: COLORS.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerBox}>
            <Text style={[styles.headerTitle, { color: COLORS.accent }]}>
              📚 NCERT Textbooks
            </Text>
            <Text style={[styles.subtitle, { color: COLORS.sub }]}>
              Authentic NCERT textbooks for UPSC preparation
            </Text>
          </View>

          {/* Book Cards */}
          {books.length === 0 ? (
            <Text style={[styles.subtitle, { color: COLORS.sub, textAlign: "center" }]}>
              No NCERT references available yet.
            </Text>
          ) : (
            books.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: COLORS.card,
                    borderColor: COLORS.border,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => Linking.openURL(book.pdfUrl)}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: isDark ? "#0f172a" : "#e0f2fe" },
                  ]}
                >
                  <MaterialIcons name="menu-book" size={30} color={COLORS.accent} />
                </View>
                <Text style={[styles.subjectText, { color: COLORS.cardText }]}>
                  Class {book.classNumber} · {book.subjectName}
                </Text>
                <Text style={[styles.openText, { color: COLORS.cardSub }]}>
                  {book.title ?? "Tap to open PDF"}
                </Text>
              </TouchableOpacity>
            ))
          )}

          {/* Visit Button */}
          <TouchableOpacity
            style={[styles.visitButton, { backgroundColor: COLORS.accent }]}
            onPress={() => Linking.openURL("https://ncert.nic.in/textbook.php")}
          >
            <Ionicons name="globe-outline" size={20} color="#fff" />
            <Text style={styles.visitText}>Visit NCERT Official Website</Text>
          </TouchableOpacity>

          {/* Disclaimer */}
          <View
            style={[
              styles.footer,
              { borderTopColor: COLORS.border },
            ]}
          >
            <Text
              style={[
                styles.footerTitle,
                { color: COLORS.accent },
              ]}
            >
              📜 Disclaimer
            </Text>
            <Text style={[styles.footerText, { color: COLORS.sub }]}>
              All NCERT books and content belong to{" "}
              <Text style={styles.highlight}>
                National Council of Educational Research and Training (NCERT)
              </Text>
              , Ministry of Education, Government of India.
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    marginTop: 10,
    fontSize: 14,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 0.4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },

  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
    minHeight: height * 0.9,
  },

  contentBox: {
    width: "90%",
    borderRadius: 16,
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderWidth: 1,
    alignItems: "center",
  },

  headerBox: {
    alignItems: "center",
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },

  classContainer: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  classTitle: {
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 12,
  },

  card: {
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 0.8,
  },
  iconBox: {
    borderRadius: 50,
    padding: 10,
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 15,
    fontWeight: "700",
  },
  openText: {
    fontSize: 12,
    marginTop: 2,
  },

  visitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    width: "90%",
    marginTop: 20,
  },
  visitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },

  footer: {
    marginTop: 30,
    borderTopWidth: 0.5,
    paddingTop: 12,
  },
  footerTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  footerText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  highlight: {
    color: "#38bdf8",
    fontWeight: "700",
  },
});
