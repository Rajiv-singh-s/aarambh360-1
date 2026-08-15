// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyD6GpPOaAUbRrIyJjZnXfuSCtI7Hfwg64Y",
  authDomain: "aarambh360-97dfe.firebaseapp.com",
  databaseURL: "https://aarambh360-97dfe-default-rtdb.firebaseio.com",
  projectId: "aarambh360-97dfe",
  storageBucket: "aarambh360-97dfe.firebasestorage.app",
  messagingSenderId: "560234410101",
  appId: "1:560234410101:web:36f7b898768e4e58c4483c",
  measurementId: "G-0WL0TG95LJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

