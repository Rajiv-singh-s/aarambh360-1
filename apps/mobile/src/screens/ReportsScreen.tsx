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
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
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
    backgroundColor: "#ef44441a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },
  questionText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 22,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reasonBox: {
    backgroundColor: COLORS.bg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  reasonTitle: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  reasonText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  adminNotesBox: {
    backgroundColor: "#16a34a1a",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  adminNotesTitle: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  adminNotesText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  dateText: {
    color: COLORS.sub,
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
});
