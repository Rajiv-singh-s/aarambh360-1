import SafeContainer from '../components/SafeContainer';
// src/screens/StrategyScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

// Enable smooth animation on Android
if (Platform.OS === "android") {

}

export default function StrategyScreen({ navigation }: any) {
  const [open, setOpen] = useState<number | null>(null);

  const isDark = useColorScheme() === "dark";

  const COLORS = {
    bg: isDark
      ? (["#0b1220", "#111b2e"] as [string, string])
      : (["#eaf2ff", "#ffffff"] as [string, string]),

    card: isDark
      ? "rgba(255,255,255,0.05)"
      : "rgba(0,0,0,0.05)",

    border: isDark
      ? "rgba(255,255,255,0.07)"
      : "rgba(0,0,0,0.12)",

    accent: isDark ? "#06b6d4" : "#0284c7",

    text: isDark ? "#e2e8f0" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
  };

  const toggleSection = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(open === i ? null : i);
  };

  const sections = [
    {
      title: "Prelims Strategy",
      content: `
1. Build strong NCERT foundation (Class 6–12).
2. Use Laxmikanth, Spectrum, NCERTs, Shankar IAS, and standard books.
3. Solve 20–30 MCQs daily.
4. Join a good test series early.
5. Revise every Sunday.
6. Reduce guesswork by improving elimination techniques.
      `,
    },
    {
      title: "Mains Strategy",
      content: `
1. Learn answer-writing format (Intro - Body - Conclusion).
2. Focus on diagrams, maps, and structured answers.
3. Read newspapers daily and maintain notes.
4. Use 3–2–1 revision rule.
5. Solve previous year GS questions.
6. Write at least 5 answers daily.
      `,
    },
    {
      title: "Interview Strategy",
      content: `
1. Know your DAF thoroughly.
2. Maintain calm body language.
3. Practice mock interviews.
4. Stay updated with current affairs.
5. Say "I don't know" honestly if needed.
      `,
    },
    {
      title: "Optional Strategy",
      content: `
1. Choose optional based on interest.
2. Stick to standard books.
3. Revise one cycle before test series.
4. Solve all previous year questions.
5. Write optional answers weekly.
      `,
    },
    {
      title: "Common Mistakes",
      content: `
• Not enough revision.
• Too many books.
• No PYQ practice.
• Rote learning instead of clarity.
• Ignoring CSAT till last month.
• No self-analysis.
      `,
    },
    {
      title: "Toppers' Tips",
      content: `
• Consistency > Intensity.
• Small daily goals beat big targets.
• Revise 3–4 times minimum.
• Practice answer writing.
• Maintain mental + physical health.
      `,
    },
  ];

  return (
    <LinearGradient colors={COLORS.bg} style={{ flex: 1 }}>
      <SafeContainer style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <BlurView
            intensity={40}
            tint={isDark ? "dark" : "light"}
            style={styles.header}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backBtn, { backgroundColor: COLORS.card }]}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.accent} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: COLORS.text }]}>
              UPSC Strategy
            </Text>

            <Ionicons name="bulb-outline" size={26} color={COLORS.accent} />
          </BlurView>

          {/* STRATEGY SECTIONS */}
          {sections.map((sec, i) => (
            <View
              key={i}
              style={[
                styles.card,
                {
                  backgroundColor: COLORS.card,
                  borderColor: COLORS.border,
                },
              ]}
            >
              <TouchableOpacity onPress={() => toggleSection(i)}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: COLORS.accent }]}>
                    {sec.title}
                  </Text>
                  <Ionicons
                    name={open === i ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={COLORS.accent}
                  />
                </View>
              </TouchableOpacity>

              {open === i && (
                <Text style={[styles.cardContent, { color: COLORS.text }]}>
                  {sec.content}
                </Text>
              )}
            </View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.6,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardContent: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
  },
});
