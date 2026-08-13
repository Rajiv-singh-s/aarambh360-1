// src/screens/NoteScreen.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  UIManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme";
import { useStudyMaterials } from "../hooks/useContent";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function NotesScreen({ navigation }: any) {
  const THEME = useTheme();
  const { data: materials, loading } = useStudyMaterials();

  if (loading) {
    return (
      <LinearGradient colors={THEME.bg} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={THEME.accent} />
        <Text style={{ color: THEME.text2, marginTop: 10 }}>Loading…</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={THEME.bg} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ padding: 16 }}>
            <Text style={{ color: THEME.text, fontSize: 24, fontWeight: "800" }}>
              Study Materials
            </Text>
            <Text style={{ color: THEME.text2, marginTop: 4 }}>
              Strategy notes and reference content from the API
            </Text>
          </View>

          {materials.map((material) => (
            <TouchableOpacity
              key={material.id}
              style={{
                backgroundColor: THEME.card,
                borderWidth: 1,
                borderColor: THEME.border,
                padding: 16,
                marginHorizontal: 16,
                borderRadius: 14,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: THEME.text, fontSize: 17, fontWeight: "700" }}>
                {material.title}
              </Text>
              <Text style={{ color: THEME.text2, marginTop: 6 }}>
                {material.materialType}
              </Text>
              {material.description ? (
                <Text style={{ color: THEME.text2, marginTop: 6 }}>{material.description}</Text>
              ) : null}
            </TouchableOpacity>
          ))}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
