import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";

const CHEAT_DATA = [
  { id: "c1", type: "Article", title: "Article 14", desc: "Equality before law and equal protection of laws.", tags: "fundamental rights, equality" },
  { id: "c2", type: "Article", title: "Article 21", desc: "Protection of life and personal liberty. No person shall be deprived of his life or personal liberty except according to procedure established by law.", tags: "life, liberty, fundamental rights" },
  { id: "c3", type: "Article", title: "Article 32", desc: "Remedies for enforcement of rights conferred by this Part (Right to Constitutional Remedies).", tags: "writs, supreme court, fundamental rights" },
  
  { id: "c4", type: "Amendment", title: "42nd Amendment (1976)", desc: "Known as the 'Mini-Constitution'. Added Socialist, Secular, and Integrity to the Preamble. Added Fundamental Duties (Part IVA).", tags: "mini constitution, preamble, duties" },
  { id: "c5", type: "Amendment", title: "44th Amendment (1978)", desc: "Reversed many changes of the 42nd Amendment. Removed Right to Property from Fundamental Rights.", tags: "property, emergency" },
  { id: "c6", type: "Amendment", title: "73rd Amendment (1992)", desc: "Granted constitutional status to Panchayati Raj Institutions (PRIs).", tags: "panchayat, local govt" },

  { id: "c7", type: "Judgment", title: "Kesavananda Bharati Case (1973)", desc: "Established the 'Basic Structure Doctrine'. Parliament can amend the constitution but cannot alter its basic structure.", tags: "basic structure, amendment power" },
  { id: "c8", type: "Judgment", title: "Minerva Mills Case (1980)", desc: "Established that the Indian Constitution is founded on the bedrock of balance between Fundamental Rights and Directive Principles.", tags: "balance, dpsp, basic structure" },
  { id: "c9", type: "Judgment", title: "Puttaswamy Case (2017)", desc: "Unanimously recognized the Right to Privacy as a fundamental right under Article 21.", tags: "privacy, article 21" },
];

const TABS = ["All", "Article", "Amendment", "Judgment"];

export default function CheatSheetScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f0ff", "#ffffff"] as [string, string]),
    cardBg: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    accent: "#3b82f6",
  };

  const filteredData = useMemo(() => {
    return CHEAT_DATA.filter((item) => {
      const matchesTab = activeTab === "All" || item.type === activeTab;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        item.tags.includes(query);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: COLORS.text }]}>Cheat Sheet</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBox, { backgroundColor: COLORS.cardBg, borderColor: COLORS.border }]}>
              <Ionicons name="search" size={20} color={COLORS.sub} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: COLORS.text }]}
                placeholder="Search articles, cases, keywords..."
                placeholderTextColor={COLORS.sub}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color={COLORS.sub} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabBtn,
                    activeTab === tab ? { backgroundColor: COLORS.accent } : { backgroundColor: "transparent", borderColor: COLORS.border, borderWidth: 1 },
                  ]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, { color: activeTab === tab ? "#fff" : COLORS.text }]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* List */}
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
            {filteredData.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={60} color={COLORS.sub} />
                <Text style={[styles.emptyText, { color: COLORS.text }]}>No results found</Text>
              </View>
            ) : (
              filteredData.map((item) => (
                <View key={item.id} style={[styles.card, { backgroundColor: COLORS.cardBg, borderColor: COLORS.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: COLORS.accent + "20" }]}>
                      <Text style={[styles.typeText, { color: COLORS.accent }]}>{item.type}</Text>
                    </View>
                  </View>
                  <Text style={[styles.title, { color: COLORS.text }]}>{item.title}</Text>
                  <Text style={[styles.desc, { color: COLORS.sub }]}>{item.desc}</Text>
                </View>
              ))
            )}
          </ScrollView>

        </KeyboardAvoidingView>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backBtn: { padding: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  tabsWrapper: {
    marginBottom: 8,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  desc: {
    fontSize: 15,
    lineHeight: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
});
