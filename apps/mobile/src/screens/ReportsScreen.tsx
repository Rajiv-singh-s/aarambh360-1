import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";
import { apiGet } from "../services/apiClient";
import type { ReportDto } from "@aarambh360/types";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  bg: "#0f172a",
  card: "#1e293b",
  text: "#f8fafc",
  sub: "#94a3b8",
  accent: "#0284c7",
  success: "#16a34a",
  border: "#334155",
  danger: "#ef4444",
  warning: "#f59e0b",
};

export default function ReportsScreen() {
  const navigation = useNavigation();
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
      case "RESOLVED":
        return COLORS.success;
      case "OPEN":
      case "IN_REVIEW":
        return COLORS.warning;
      case "DISMISSED":
        return COLORS.sub;
      default:
        return COLORS.sub;
    }
  };

  const renderItem = ({ item }: { item: ReportDto }) => {
    const isExpanded = expandedId === item.id;
    const q = item.question;
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.cardHeader}
          onPress={() => toggleExpand(item.id)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="flag" size={20} color={COLORS.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
            </View>
            <Text style={styles.questionText} numberOfLines={isExpanded ? undefined : 2}>
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
          <View style={styles.expandedContent}>
            <View style={styles.reasonBox}>
              <Text style={styles.reasonTitle}>Your Report Reason:</Text>
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>

            {item.adminNotes && (
              <View style={styles.adminNotesBox}>
                <Text style={styles.adminNotesTitle}>Admin Response:</Text>
                <Text style={styles.adminNotesText}>{item.adminNotes}</Text>
              </View>
            )}

            <Text style={styles.dateText}>
              Reported on: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
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
        <Text style={styles.headerTitle}>My Reports</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="flag-outline" size={60} color={COLORS.border} />
          <Text style={styles.emptyText}>No reports yet</Text>
          <Text style={styles.emptySub}>Questions you report for errors will appear here.</Text>
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
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderColor: "#0f172a",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
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
    fontSize: 20,
    fontWeight: "900",
    marginTop: 16,
  },
  emptySub: {
    color: COLORS.sub,
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
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderBottomWidth: 5,
    borderBottomColor: "#0f172a",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ef444422",
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
    color: COLORS.text,
    lineHeight: 24,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  reasonBox: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  reasonTitle: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  reasonText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  adminNotesBox: {
    backgroundColor: "#16a34a1a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  adminNotesTitle: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  adminNotesText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  dateText: {
    color: COLORS.sub,
    fontSize: 13,
    textAlign: "right",
    marginTop: 6,
    fontWeight: "600",
  },
});
