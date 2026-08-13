// Simplified chapter reader — loads study material content from API when materialId is passed
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useStudyMaterials } from "../hooks/useContent";
import { trackLearningEvent } from "../services/analyticsService";

export default function ChapterScreen({ route, navigation }: any) {
  const { subject, chapter, materialId } = route.params || {};
  const { data: materials, loading } = useStudyMaterials();
  const isDark = useColorScheme() === "dark";

  React.useEffect(() => {
    if (!loading) {
      const activeMaterial =
        materials.find((item) => item.id === materialId) ??
        materials.find((item) => item.title?.toLowerCase() === String(chapter ?? "").toLowerCase());

      trackLearningEvent({
        eventType: "LESSON_READ",
        entityType: "StudyMaterial",
        entityId: activeMaterial?.id ?? materialId ?? "unknown",
        metadata: {
          title: activeMaterial?.title ?? chapter ?? "Unknown Chapter",
          subject: subject ?? "Unknown Subject",
        },
      }).catch((err) => console.error("Error tracking LESSON_READ:", err));
    }
  }, [loading, materials, materialId, chapter, subject]);

  const COLORS = {
    bg: isDark
      ? (["#0b1220", "#111b2e"] as [string, string])
      : (["#e8f0ff", "#ffffff"] as [string, string]),
    card: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    accent: isDark ? "#06b6d4" : "#0284c7",
    text: isDark ? "#e2e8f0" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
  };

  const material =
    materials.find((item) => item.id === materialId) ??
    materials.find((item) => item.title?.toLowerCase() === String(chapter ?? "").toLowerCase());

  if (loading) {
    return (
      <LinearGradient colors={COLORS.bg} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.bg} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 16, flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.accent} />
          </TouchableOpacity>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "700", marginLeft: 12 }}>
            {subject ?? "Chapter"}
          </Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ color: COLORS.accent, fontSize: 22, fontWeight: "800" }}>
            {material?.title ?? chapter ?? "Chapter"}
          </Text>
          <Text style={{ color: COLORS.sub, marginTop: 8 }}>
            {material?.description ?? "Study material content is served from the NestJS API."}
          </Text>
          {!material ? (
            <Text style={{ color: COLORS.sub, marginTop: 16 }}>
              No matching study material found for this chapter.
            </Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
