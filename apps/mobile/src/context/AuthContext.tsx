import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Platform } from 'react-native';
import type { AuthMeResponseDto } from '@aarambh360/types';
import { auth } from '../firebaseConfig';
import { fetchAuthProfile, loginWithFirebaseToken } from '../services/authService';
import { setUnauthorizedHandler } from '../services/apiClient';
import { registerDevNotificationToken, deactivateDeviceToken } from '../services/notificationService';
import { trackLearningEvent } from '../services/analyticsService';

interface AuthContextValue {
  firebaseUser: User | null;
  profile: AuthMeResponseDto | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(auth.currentUser);
  const [profile, setProfile] = useState<AuthMeResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [registeredToken, setRegisteredToken] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setProfile(null);
      return;
    }
    const token = await user.getIdToken();
    await loginWithFirebaseToken(token);
    const me = await fetchAuthProfile();
    setProfile(me);
  }, []);

  const logout = useCallback(async () => {
    if (registeredToken) {
      try {
        await deactivateDeviceToken({
          token: registeredToken,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        });
      } catch (err) {
        console.error('Failed to deactivate device token:', err);
      }
    }
    await signOut(auth);
    setProfile(null);
    setRegisteredToken(null);
  }, [registeredToken]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
  }, [logout]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setLoading(true);
      try {
        if (user) {
          const token = await user.getIdToken();
          await loginWithFirebaseToken(token);
          const me = await fetchAuthProfile();
          setProfile(me);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (profile) {
      const initSession = async () => {
        try {
          await trackLearningEvent({ eventType: 'APP_OPEN' });
        } catch (err) {
          console.error('Failed to track APP_OPEN event:', err);
        }

        try {
          const tokenStr = await registerDevNotificationToken(
            Platform.OS === 'ios' ? 'ios' : 'android',
          );
          setRegisteredToken(tokenStr);
        } catch (err) {
          console.error('Failed to register dev notification token:', err);
        }
      };

      void initSession();
    }
  }, [profile]);

  const value = useMemo(
    () => ({ firebaseUser, profile, loading, refreshProfile, logout }),
    [firebaseUser, profile, loading, refreshProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

