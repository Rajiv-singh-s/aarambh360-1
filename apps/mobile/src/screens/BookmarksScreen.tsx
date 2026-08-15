import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";
import { apiGet } from "../services/apiClient";
import type { BookmarkDto } from "@aarambh360/types";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  bg: "#0f172a",
  card: "#1e293b",
  text: "#f8fafc",
  sub: "#94a3b8",
  accent: "#0284c7",
  success: "#16a34a",
  border: "#334155",
};

export default function BookmarksScreen() {
  const navigation = useNavigation();
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
      setBookmarks(data);
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
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
        <View style={styles.card}>
          <Text style={{ color: COLORS.sub }}>Question data unavailable.</Text>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.cardHeader}
          onPress={() => toggleExpand(item.id)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="bookmark" size={20} color={COLORS.accent} />
          </View>
          <Text style={styles.questionText} numberOfLines={isExpanded ? undefined : 2}>
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
          <View style={styles.expandedContent}>
            {q.options?.map((opt, idx) => {
              const isCorrect = q.correctOptionId === opt.id;
              return (
                <View
                  key={opt.id}
                  style={[
                    styles.optionRow,
                    isCorrect && styles.correctOptionRow,
                  ]}
                >
                  <View style={[styles.optionLetter, isCorrect && styles.correctOptionLetter]}>
                    <Text style={[styles.optionLetterText, isCorrect && { color: "#fff" }]}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, isCorrect && { color: COLORS.success, fontWeight: "600" }]}>
                    {opt.text}
                  </Text>
                  {isCorrect && <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />}
                </View>
              );
            })}

            {q.explanation && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationTitle}>Explanation:</Text>
                <Text style={styles.explanationText}>{q.explanation}</Text>
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookmarks</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : bookmarks.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="bookmarks-outline" size={60} color={COLORS.border} />
          <Text style={styles.emptyText}>No bookmarks yet</Text>
          <Text style={styles.emptySub}>Questions you bookmark during quizzes will appear here.</Text>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  emptySub: {
    color: COLORS.sub,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0ea5e91a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 24,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    marginBottom: 8,
  },
  correctOptionRow: {
    backgroundColor: "#16a34a1a",
    borderColor: COLORS.success,
    borderWidth: 1,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  correctOptionLetter: {
    backgroundColor: COLORS.success,
  },
  optionLetterText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },
  optionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  explanationBox: {
    marginTop: 12,
    padding: 16,
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  explanationTitle: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },
  explanationText: {
    color: COLORS.sub,
    fontSize: 14,
    lineHeight: 22,
  },
});
