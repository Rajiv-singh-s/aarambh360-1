import React from 'react';
import { View, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SafeContainer({ children, style, disableBottom = false }: any) {
  const insets = useSafeAreaInsets();
  
  // On Android, forcefully extract the physical hardware status bar height
  // Fall back to insets.top if currentHeight is somehow undefined.
  const topPadding = Platform.OS === 'android' ? (StatusBar.currentHeight || insets.top || 30) : insets.top;
  
  // On Android, navigation bar is usually around 24-48px. 
  // If insets.bottom is 0, we force a minimum padding so it never hits the absolute bottom edge.
  const bottomPadding = disableBottom ? 0 : (Platform.OS === 'android' ? Math.max(insets.bottom, 24) : insets.bottom);
  
  return (
    <View style={[{ flex: 1, paddingTop: topPadding, paddingBottom: bottomPadding }, style]}>
      {children}
    </View>
  );
}
