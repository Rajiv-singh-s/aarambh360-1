import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Animated,
  Keyboard,
} from "react-native";
import Markdown from 'react-native-markdown-display';
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "../components/SafeContainer";
import { apiPost } from "../services/apiClient";



export default function AiMentorScreen() {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === "dark";
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [selectedMode, setSelectedMode] = useState<"general" | "eli5" | "mains">("general");
  const flatListRef = useRef<FlatList>(null);

  const COLORS = {
    bg: isDark ? (["#0b1220", "#111b2e"] as [string, string]) : (["#e9f0ff", "#ffffff"] as [string, string]),
    card: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    accent: isDark ? "#06b6d4" : "#0284c7",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#475569",
    userBubble: isDark ? "#06b6d4" : "#0284c7",
    userText: "#ffffff",
    aiBubble: isDark ? "#1e293b" : "#f1f5f9",
    aiText: isDark ? "#f8fafc" : "#0f172a",
    badgeBg: isDark ? "rgba(6,182,212,0.15)" : "#e0f2fe",
  };

  const markdownStyles = {
    body: { color: COLORS.aiText, fontSize: 14, lineHeight: 22 },
    paragraph: { marginTop: 0, marginBottom: 10 },
    strong: { fontWeight: '700' },
    heading1: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
    heading2: { fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 5 },
    list_item: { marginBottom: 4 },
  };

  const MODES = [
    { id: "general", label: "Standard", icon: "school-outline" },
    { id: "eli5", label: "Explain Like I'm 5", icon: "happy-outline" },
    { id: "mains", label: "Mains Structure", icon: "create-outline" },
  ];

  useEffect(() => {
    // Scroll to bottom when messages update
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);



  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const userMsg = { id: Date.now().toString(), role: "user", content: inputText };
    
    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);
    
    // Create the conversation history to send (excluding IDs)
    const conversationHistory = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const response = await apiPost("/ai-mentor/chat", {
        messages: conversationHistory,
        mode: selectedMode
      });
      
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response.content || "I encountered an error generating a response.",
        mode: response.mode || selectedMode,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Sorry, I am currently unavailable or the server is unreachable. Please check your connection or try again later.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.role === "user";

    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperAi]}>
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: COLORS.accent }]}>
            <MaterialCommunityIcons name="robot-outline" size={16} color="#fff" />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: COLORS.userBubble, borderBottomRightRadius: 4 }
              : { backgroundColor: COLORS.aiBubble, borderBottomLeftRadius: 4 },
          ]}
        >
          {item.mode && item.mode !== "general" && !isUser && (
            <View style={[styles.modeIndicator, { backgroundColor: COLORS.badgeBg }]}>
              <Ionicons
                name={item.mode === "eli5" ? "happy" : "create"}
                size={12}
                color={COLORS.accent}
              />
              <Text style={[styles.modeIndicatorText, { color: COLORS.accent }]}>
                {item.mode === "eli5" ? "ELI5 Mode" : "Mains Mode"}
              </Text>
            </View>
          )}

          {isUser ? (
            <Text style={[styles.messageText, { color: COLORS.userText }]}>
              {item.content}
            </Text>
          ) : (
            <Markdown style={markdownStyles}>
              {item.content}
            </Markdown>
          )}

          {item.citation && !isUser && (
            <View style={[styles.citationBox, { borderTopColor: COLORS.border }]}>
              <Ionicons name="library-outline" size={12} color={COLORS.sub} />
              <Text style={[styles.citationText, { color: COLORS.sub }]}>{item.citation}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={COLORS.bg} style={styles.safe}>
      <SafeContainer style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: isDark ? "rgba(11,18,32,0.95)" : "rgba(255,255,255,0.95)", borderBottomColor: COLORS.border }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: COLORS.text }]}>UPSC Mentor</Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proText}>BETA</Text>
                </View>
              </View>
              <Text style={[styles.subtitle, { color: COLORS.sub }]}>RAG-Powered AI Tutor</Text>
            </View>

            <TouchableOpacity style={styles.backBtn}>
              <Ionicons name="ellipsis-vertical" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* MODE SELECTOR */}
          <View style={styles.modeScroll}>
            {MODES.map((m) => {
              const isSelected = selectedMode === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.modePill,
                    {
                      backgroundColor: isSelected ? COLORS.accent : COLORS.card,
                      borderColor: isSelected ? COLORS.accent : COLORS.border,
                    },
                  ]}
                  onPress={() => setSelectedMode(m.id as any)}
                >
                  <Ionicons name={m.icon as any} size={14} color={isSelected ? "#fff" : COLORS.text} />
                  <Text style={[styles.modePillText, { color: isSelected ? "#fff" : COLORS.text }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CHAT AND INPUT AREA */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={isLoading ? [...messages, { id: 'loading', role: 'ai', isTyping: true }] : messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              if (item.isTyping) {
                return (
                  <View style={[styles.messageWrapper, styles.messageWrapperAi]}>
                    <View style={[styles.avatar, { backgroundColor: COLORS.accent }]}>
                      <MaterialCommunityIcons name="robot-outline" size={16} color="#fff" />
                    </View>
                    <View style={[styles.bubble, { backgroundColor: COLORS.aiBubble, borderBottomLeftRadius: 4 }]}>
                      <Text style={[styles.messageText, { color: COLORS.sub, fontStyle: 'italic' }]}>
                        Mentor is thinking...
                      </Text>
                    </View>
                  </View>
                );
              }
              return renderMessage({ item });
            }}
            contentContainerStyle={styles.chatContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* INPUT AREA */}
          <View style={[styles.inputContainer, { backgroundColor: isDark ? "#0f172a" : "#ffffff", borderTopColor: COLORS.border }]}>
            <TouchableOpacity style={styles.attachBtn}>
              <Ionicons name="camera-outline" size={24} color={COLORS.sub} />
            </TouchableOpacity>
            
            <TextInput
              style={[styles.input, { color: COLORS.text, backgroundColor: COLORS.card, borderColor: COLORS.border }]}
              placeholder="Ask a doubt about UPSC..."
              placeholderTextColor={COLORS.sub}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: inputText.trim() ? COLORS.accent : COLORS.card }]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons name="send" size={18} color={inputText.trim() ? "#fff" : COLORS.sub} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingTop: Platform.OS === "ios" ? 10 : 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  backBtn: { padding: 10 },
  headerTitleContainer: { flex: 1, alignItems: "center" },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: { fontSize: 18, fontWeight: "800", marginRight: 6 },
  proBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proText: { color: "#fff", fontSize: 9, fontWeight: "900" },
  subtitle: { fontSize: 12, marginTop: 2 },
  
  modeContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 50,
  },
  modeScroll: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
    justifyContent: "center",
  },
  modePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  modePillText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },

  chatContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  messageWrapperUser: {
    justifyContent: "flex-end",
  },
  messageWrapperAi: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 18,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  
  modeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  modeIndicatorText: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },

  citationBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  citationText: {
    fontSize: 11,
    fontStyle: "italic",
    marginLeft: 4,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  attachBtn: {
    padding: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    marginHorizontal: 8,
    fontSize: 15,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
