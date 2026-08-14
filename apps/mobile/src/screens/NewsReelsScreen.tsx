import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const DUMMY_NEWS = [
  {
    id: "1",
    title: "Supreme Court upholds constitutional validity of Article 370 abrogation",
    summary:
      "The Supreme Court of India unanimously upheld the power of the President to abrogate Article 370 in August 2019. The court stated that Jammu & Kashmir did not retain any element of sovereignty after the instrument of accession was signed. It also directed the Election Commission to conduct elections to the J&K legislative assembly by September 2024.",
    source: "The Hindu",
    date: "11 Dec 2023",
    paper: "GS2",
    topic: "Polity & Constitution",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop", // Law/Courts
  },
  {
    id: "2",
    title: "India completes first phase of strategic Chabahar Port project",
    summary:
      "India and Iran have signed a historic 10-year bilateral contract for the operation of the Shahid Beheshti Port in Chabahar. This marks the first time India will take over the management of an overseas port, securing a crucial transit route to Afghanistan and Central Asia, bypassing Pakistan. It significantly boosts the International North-South Transport Corridor (INSTC).",
    source: "Indian Express",
    date: "14 May 2024",
    paper: "GS2",
    topic: "International Relations",
    image: "https://images.unsplash.com/photo-1598911543265-d0ff642f4955?q=80&w=1000&auto=format&fit=crop", // Port/Ships
  },
  {
    id: "3",
    title: "RBI keeps repo rate unchanged at 6.5% for 7th consecutive time",
    summary:
      "The Reserve Bank of India's Monetary Policy Committee (MPC) decided to keep the policy repo rate unchanged at 6.50% to ensure inflation progressively aligns with the target while supporting growth. The focus remains on the withdrawal of accommodation to ensure that inflation targets are met without stifling the current economic momentum.",
    source: "LiveMint",
    date: "05 Apr 2024",
    paper: "GS3",
    topic: "Economy",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop", // Economics/Finance
  },
];

export default function NewsReelsScreen() {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const isDark = useColorScheme() === "dark";

  const handleScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / SCREEN_HEIGHT);
    setCurrentIndex(index);
  };

  const renderItem = ({ item, index }: { item: typeof DUMMY_NEWS[0]; index: number }) => {
    return (
      <View style={styles.reelContainer}>
        <Image source={{ uri: item.image }} style={styles.bgImage} />
        
        {/* Gradient Overlay for Readability */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.95)"]}
          style={styles.gradientOverlay}
        />

        <View style={styles.contentContainer}>
          {/* Tags */}
          <View style={styles.tagsRow}>
            <View style={styles.tagPaper}>
              <Text style={styles.tagPaperText}>{item.paper}</Text>
            </View>
            <View style={styles.tagTopic}>
              <Text style={styles.tagTopicText}>{item.topic}</Text>
            </View>
          </View>

          {/* Title & Summary */}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.summary}>{item.summary}</Text>

          {/* Source & Date */}
          <View style={styles.metaRow}>
            <View style={styles.sourceBox}>
              <Ionicons name="newspaper" size={14} color="#06b6d4" />
              <Text style={styles.sourceText}>{item.source}</Text>
            </View>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>

        {/* Right Sidebar Actions */}
        <View style={styles.sidebar}>
          <TouchableOpacity style={styles.sidebarBtn}>
            <Ionicons name="bookmark-outline" size={30} color="#fff" />
            <Text style={styles.sidebarText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarBtn}>
            <Ionicons name="share-social-outline" size={30} color="#fff" />
            <Text style={styles.sidebarText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarBtn}>
            <FontAwesome5 name="book-open" size={24} color="#fff" />
            <Text style={styles.sidebarText}>Read full</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Overlay */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Current Affairs</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={DUMMY_NEWS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  reelContainer: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    justifyContent: "flex-end",
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 90 : 70,
    paddingRight: 70, // Leave space for sidebar
  },
  tagsRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tagPaper: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  tagPaperText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },
  tagTopic: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagTopicText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 32,
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  summary: {
    color: "#cbd5e1",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sourceBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sourceText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 6,
  },
  dateText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  sidebar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 90 : 70,
    right: 10,
    alignItems: "center",
  },
  sidebarBtn: {
    alignItems: "center",
    marginBottom: 24,
  },
  sidebarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
