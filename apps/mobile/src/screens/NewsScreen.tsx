import SafeContainer from '../components/SafeContainer';
// src/screens/NewsScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { BlurView } from "expo-blur";

const API_KEY = "4044ce8f82934ef4b96ac2ccc0b9869f";
const QUERY =
  "UPSC OR government OR policy OR India OR economy OR environment OR education";
const URL = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
  QUERY
)}&domains=thehindu.com,indianexpress.com,downtoearth.org.in,prsindia.org&language=en&sortBy=publishedAt&pageSize=50&apiKey=${API_KEY}`;

const { width } = Dimensions.get("window");

export default function NewsScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const isDark = useColorScheme() === "dark";

  const COLORS = {
    bg: (isDark
      ? ["#0b1220", "#111b2e"]
      : ["#e8f0ff", "#ffffff"]) as [string, string],

    card: isDark
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.05)",

    border: isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.12)",

    text: isDark ? "#e2e8f0" : "#1e293b",
    sub: isDark ? "#94a3b8" : "#475569",
    accent: isDark ? "#06b6d4" : "#0284c7",
  };

  const fetchNews = async () => {
    try {
      const response = await fetch(URL);
      const data = await response.json();
      if (data.articles) setNews(data.articles);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews();
  }, []);

  // WebView Mode
  if (selectedArticle) {
    return (
      <SafeContainer style={{ flex: 1, backgroundColor: COLORS.bg[0] }}>
        <BlurView
          intensity={40}
          tint={isDark ? "dark" : "light"}
          style={styles.webHeader}
        >
          <TouchableOpacity onPress={() => setSelectedArticle(null)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.accent} />
          </TouchableOpacity>

          <Text style={[styles.webHeaderTitle, { color: COLORS.text }]}>
            Full Article
          </Text>
        </BlurView>

        <WebView
          source={{ uri: selectedArticle }}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator
              size="large"
              color={COLORS.accent}
              style={{ marginTop: 20 }}
            />
          )}
          style={{ flex: 1 }}
        />
      </SafeContainer>
    );
  }

  // Main UI
  return (
    <LinearGradient colors={COLORS.bg} style={{ flex: 1 }}>
      <SafeContainer style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 16 }}
        >
          {/* HEADER */}
          <BlurView
            intensity={40}
            tint={isDark ? "dark" : "light"}
            style={styles.headerBox}
          >
            <Text style={[styles.headerTitle, { color: COLORS.text }]}>
              🗞️ UPSC Daily News
            </Text>
            <Text style={[styles.headerSubtitle, { color: COLORS.sub }]}>
              Stay updated with policy, governance & current affairs
            </Text>
          </BlurView>

          {/* LOADING */}
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={[styles.loading, { color: COLORS.sub }]}>
                Fetching news...
              </Text>
            </View>
          ) : (
            news.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.card,
                  {
                    backgroundColor: COLORS.card,
                    borderColor: COLORS.border,
                  },
                ]}
                onPress={() => setSelectedArticle(item.url)}
                activeOpacity={0.9}
              >
                {/* IMAGE */}
                {item.urlToImage ? (
                  <Image
                    source={{ uri: item.urlToImage }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={COLORS.sub}
                    />
                  </View>
                )}

                {/* CONTENT */}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.sourceText, { color: COLORS.accent }]}>
                      {item.source?.name || "Unknown"}
                    </Text>
                    <Text style={[styles.dateText, { color: COLORS.sub }]}>
                      {new Date(item.publishedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </Text>
                  </View>

                  <Text style={[styles.title, { color: COLORS.text }]}>
                    {item.title}
                  </Text>

                  <Text style={[styles.description, { color: COLORS.sub }]}>
                    {item.description || "No description available."}
                  </Text>

                  <View style={styles.linkRow}>
                    <Ionicons name="link-outline" size={16} color={COLORS.accent} />
                    <Text style={[styles.linkText, { color: COLORS.accent }]}>
                      Read Full Article
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center" },
  loading: { marginTop: 10 },

  // HEADER
  headerBox: {
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
  },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  headerSubtitle: { fontSize: 14, marginTop: 6, textAlign: "center" },

  // CARD
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  image: { width: "100%", height: width * 0.45 },
  imagePlaceholder: {
    width: "100%",
    height: width * 0.45,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: { padding: 16 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  sourceText: { fontSize: 12, fontWeight: "600" },
  dateText: { fontSize: 12 },

  title: { fontWeight: "700", fontSize: 15, marginTop: 6 },
  description: { fontSize: 13, marginTop: 6, lineHeight: 20 },

  linkRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  linkText: { marginLeft: 4, fontWeight: "600" },

  // WEBVIEW HEADER
  webHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.6,
  },
  webHeaderTitle: { fontSize: 18, fontWeight: "700", marginLeft: 12 },
});
