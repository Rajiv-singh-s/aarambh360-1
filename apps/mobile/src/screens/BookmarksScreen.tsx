import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";
import { apiGet } from "../services/apiClient";
import type { BookmarkDto } from "@aarambh360/types";
import { Ionicons } from "@expo/vector-icons";

const getColors = (isDark: boolean) => ({
  bg: isDark ? "#0f172a" : "#f1f5f9",
  card: isDark ? "#1e293b" : "#ffffff",
  text: isDark ? "#f8fafc" : "#0f172a",
  sub: isDark ? "#94a3b8" : "#64748b",
  accent: "#0ea5e9",
  success: "#16a34a",
  border: isDark ? "#334155" : "#e2e8f0",
  shadow: isDark ? "#0f172a" : "#cbd5e1",
});

export default function BookmarksScreen() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const COLORS = getColors(isDark);
  
  const [bookmarks, setBookmarks] = useState<BookmarkDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const data = await apiGet<BookmarkDto[]>("/bookmarks");
      setBookmarks(data || []);
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const renderItem = ({ item }: { item: BookmarkDto }) => {
    const isExpanded = expandedId === item.id;
    const q = item.question;

    if (!q) {
      return (
        <View style={[styles.card, { backgroundColor: COLORS.card, borderColor: COLORS.border, borderBottomColor: COLORS.shadow }]}>
          <Text style={{ color: COLORS.sub }}>Question data unavailable.</Text>
        </View>
      );
    }

    return (
      <View style={[styles.card, { backgroundColor: COLORS.card, borderColor: COLORS.border, borderBottomColor: COLORS.shadow }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.cardHeader}
          onPress={() => toggleExpand(item.id)}
        >
          <View style={[styles.iconContainer, { backgroundColor: isDark ? "#0ea5e922" : "#e0f2fe" }]}>
            <Ionicons name="bookmark" size={20} color={COLORS.accent} />
          </View>
          <Text style={[styles.questionText, { color: COLORS.text }]} numberOfLines={isExpanded ? undefined : 2}>
            {q.text}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.sub}
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={[styles.expandedContent, { borderTopColor: COLORS.border }]}>
            {q.options && q.options.length > 0 ? (
              q.options.map((opt, idx) => {
                const isCorrect = q.correctOptionId === opt.id;
                return (
                  <View
                    key={opt.id}
                    style={[
                      styles.optionRow,
                      { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", borderColor: COLORS.border },
                      isCorrect && { backgroundColor: isDark ? "#16a34a1a" : "#dcfce3", borderColor: COLORS.success, borderWidth: 2 },
                    ]}
                  >
                    <View style={[styles.optionLetter, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0" }, isCorrect && { backgroundColor: COLORS.success }]}>
                      <Text style={[styles.optionLetterText, { color: isDark ? "#f8fafc" : "#334155" }, isCorrect && { color: "#ffffff" }]}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, { color: COLORS.text }, isCorrect && { color: COLORS.success, fontWeight: "700" }]}>
                      {opt.text}
                    </Text>
                    {isCorrect && <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />}
                  </View>
                );
              })
            ) : (
              <Text style={{ color: COLORS.sub, fontStyle: 'italic', marginBottom: 10 }}>
                No options available for this question type.
              </Text>
            )}

            {q.explanation && (
              <View style={[styles.explanationBox, { backgroundColor: isDark ? "#0f172a" : "#f1f5f9" }]}>
                <Text style={styles.explanationTitle}>Explanation:</Text>
                <Text style={[styles.explanationText, { color: COLORS.sub }]}>{q.explanation}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeContainer>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: COLORS.card, borderBottomColor: COLORS.shadow }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>My Bookmarks</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : bookmarks.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="bookmarks-outline" size={60} color={COLORS.border} />
          <Text style={[styles.emptyText, { color: COLORS.text }]}>No bookmarks yet</Text>
          <Text style={[styles.emptySub, { color: COLORS.sub }]}>Questions you bookmark during quizzes will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 16,
  },
  emptySub: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderBottomWidth: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    paddingTop: 2,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: "900",
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  explanationBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
  },
  explanationTitle: {
    color: "#0ea5e9",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "500",
  },
});
