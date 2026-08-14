// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./src/context/AuthContext";

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/signupScreen";
import ExamHomeScreen from "./src/screens/ExamHomeScreen";
import QuizScreen from "./src/screens/QuizScreen";
import QuizResultScreen from "./src/screens/QuizResultScreen";
import MCQScreen from "./src/screens/MCQScreen";
import SyllabusScreen from "./src/screens/SyllabusScreen";
import NcertScreen from "./src/screens/NcertScreen";
import ExamInfoScreen from "./src/screens/examinfoScreen";
import NewsScreen from "./src/screens/NewsScreen";
import StreakScreen from "./src/screens/StreakScreen";
import MainScreen from "./src/screens/MainScreen";
import CutOffScreen from "./src/screens/CutOffScreen";
import StrategyScreen from "./src/screens/StrategyScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import NotesScreen from "./src/screens/NoteScreen";
import PYQScreen from "./src/screens/pyqScreen";
import MainHomeScreen from "./src/screens/MainHomeScreen";
import ChapterScreen from "./src/screens/ChapterScreen";
import LearnScreen from "./src/screens/LearnScreen";
import AiMentorScreen from "./src/screens/AiMentorScreen";
import NewsReelsScreen from "./src/screens/NewsReelsScreen";
import FlashcardsScreen from "./src/screens/FlashcardsScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";
import StudyRoomScreen from "./src/screens/StudyRoomScreen";
import TestSeriesHubScreen from "./src/screens/TestSeriesHubScreen";
import ActiveMockTestScreen from "./src/screens/ActiveMockTestScreen";
import MapPracticeScreen from "./src/screens/MapPracticeScreen";
import SyllabusTrackerScreen from "./src/screens/SyllabusTrackerScreen";
import WeaknessVaultScreen from "./src/screens/WeaknessVaultScreen";
import CheatSheetScreen from "./src/screens/CheatSheetScreen";
import SubscriptionScreen from "./src/screens/SubscriptionScreen";
import NotificationScreen from "./src/screens/NotificationScreen";

// Type definitions for navigation
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  NotificationScreen: undefined;
  ExamHomeScreen: { exam?: string } | undefined;
  QuizScreen: {
    topicId?: string;
    subject?: string;
    class?: number | "all";
    subjectKey?: string;
    classKey?: string;
    classNumber?: number;
    count?: number;
  };
  QuizResultScreen: {
    sessionId?: string;
    correctCount?: number;
    incorrectCount?: number;
    totalQuestions?: number;
    accuracy?: number;
    timeTakenSeconds?: number;
    subject?: string;
    questions?: any[];
    answers?: any[];
    timeTaken?: string;
    subjectKey?: string;
    classKey?: string;
  } | undefined;
  MCQScreen: undefined;
  SyllabusScreen: undefined;
  NcertScreen: undefined;
  ExamInfoScreen: undefined;
  NewsScreen: undefined;
  StreakScreen: undefined;
  MainScreen: undefined;
  CutOffScreen: undefined;
  StrategyScreen: undefined;
  ProfileScreen: undefined;
  NotesScreen: undefined;
  PYQScreen: undefined;
  MainHomeScreen: undefined;
  LearnScreen: undefined;
  AiMentorScreen: undefined;
  NewsReelsScreen: undefined;
  FlashcardsScreen: undefined;
  LeaderboardScreen: undefined;
  StudyRoomScreen: undefined;
  TestSeriesHubScreen: undefined;
  ActiveMockTestScreen: undefined;
  MapPracticeScreen: undefined;
  SyllabusTrackerScreen: undefined;
  WeaknessVaultScreen: undefined;
  CheatSheetScreen: undefined;
  SubscriptionScreen: undefined;
  ChapterScreen: { subject: string; chapter: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="MainHomeScreen" component={MainHomeScreen} />
          <Stack.Screen name="LearnScreen" component={LearnScreen} />
          <Stack.Screen name="AiMentorScreen" component={AiMentorScreen} />
          <Stack.Screen name="NewsReelsScreen" component={NewsReelsScreen} />
          <Stack.Screen name="FlashcardsScreen" component={FlashcardsScreen} />
          <Stack.Screen name="LeaderboardScreen" component={LeaderboardScreen} />
          <Stack.Screen name="StudyRoomScreen" component={StudyRoomScreen} />
          <Stack.Screen name="TestSeriesHubScreen" component={TestSeriesHubScreen} />
          <Stack.Screen name="ActiveMockTestScreen" component={ActiveMockTestScreen} />
          <Stack.Screen name="MapPracticeScreen" component={MapPracticeScreen} />
          <Stack.Screen name="SyllabusTrackerScreen" component={SyllabusTrackerScreen} />
          <Stack.Screen name="WeaknessVaultScreen" component={WeaknessVaultScreen} />
          <Stack.Screen name="CheatSheetScreen" component={CheatSheetScreen} />
          <Stack.Screen name="ExamHomeScreen" component={ExamHomeScreen} />
          <Stack.Screen name="QuizScreen" component={QuizScreen} />
          <Stack.Screen name="QuizResultScreen" component={QuizResultScreen} />
          <Stack.Screen name="MCQScreen" component={MCQScreen} />
          <Stack.Screen name="SyllabusScreen" component={SyllabusScreen} />
          <Stack.Screen name="NcertScreen" component={NcertScreen} />
          <Stack.Screen name="ExamInfoScreen" component={ExamInfoScreen} />
          <Stack.Screen name="NewsScreen" component={NewsScreen} />
          <Stack.Screen name="StreakScreen" component={StreakScreen} />
          <Stack.Screen name="MainScreen" component={MainScreen} />
          <Stack.Screen name="CutOffScreen" component={CutOffScreen} />
          <Stack.Screen name="StrategyScreen" component={StrategyScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="NotesScreen" component={NotesScreen} />
          <Stack.Screen name="PYQScreen" component={PYQScreen} />
          <Stack.Screen name="ChapterScreen" component={ChapterScreen} />
          <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
