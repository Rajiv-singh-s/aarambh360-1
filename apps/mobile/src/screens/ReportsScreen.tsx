import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";
import { apiGet } from "../services/apiClient";
import type { ReportDto } from "@aarambh360/types";
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

export default function ReportsScreen() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const COLORS = getColors(isDark);
  
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await apiGet<ReportDto[]>("/reports");
      setReports(data || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "#eab308";
      case "IN_PROGRESS":
        return "#3b82f6";
      case "RESOLVED":
        return "#22c55e";
      case "CLOSED":
        return "#94a3b8";
      default:
        return "#94a3b8";
    }
  };

  const renderItem = ({ item }: { item: ReportDto }) => {
    const isExpanded = expandedId === item.id;
    const q = item.question;
    const statusColor = getStatusColor(item.status);
    const date = new Date(item.createdAt).toLocaleDateString();

    return (
      <View style={[styles.card, { backgroundColor: COLORS.card, borderColor: COLORS.border, borderBottomColor: COLORS.shadow }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.cardHeader}
          onPress={() => toggleExpand(item.id)}
        >
          <View style={[styles.iconContainer, { backgroundColor: isDark ? "#ef444422" : "#fee2e2" }]}>
            <Ionicons name="flag" size={20} color="#ef4444" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
            </View>
            <Text style={[styles.questionText, { color: COLORS.text }]} numberOfLines={isExpanded ? undefined : 2}>
              {q?.text || "Question data unavailable"}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.sub}
            style={{ marginLeft: 10, marginTop: 4 }}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={[styles.expandedContent, { borderTopColor: COLORS.border }]}>
            <View style={[styles.reasonBox, { backgroundColor: isDark ? "#0f172a" : "#f1f5f9" }]}>
              <Text style={styles.reasonTitle}>Your Report Reason:</Text>
              <Text style={[styles.reasonText, { color: COLORS.text }]}>{item.reason}</Text>
            </View>
            
            {item.adminNotes && (
              <View style={[styles.adminNotesBox, { backgroundColor: isDark ? "#16a34a1a" : "#dcfce3" }]}>
                <Text style={styles.adminNotesTitle}>Admin Response:</Text>
                <Text style={[styles.adminNotesText, { color: COLORS.text }]}>{item.adminNotes}</Text>
              </View>
            )}

            <Text style={[styles.dateText, { color: COLORS.sub }]}>Reported on {date}</Text>
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
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>My Reports</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="flag-outline" size={60} color={COLORS.border} />
          <Text style={[styles.emptyText, { color: COLORS.text }]}>No reports yet</Text>
          <Text style={[styles.emptySub, { color: COLORS.sub }]}>Questions you report for errors will appear here so you can track their status.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  reasonBox: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  reasonTitle: {
    color: "#0ea5e9",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  adminNotesBox: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },
  adminNotesTitle: {
    color: "#16a34a",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  adminNotesText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  dateText: {
    fontSize: 13,
    textAlign: "right",
    marginTop: 6,
    fontWeight: "600",
  },
});
