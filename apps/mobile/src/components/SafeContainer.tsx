import React from 'react';
import { View, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SafeContainer({ children, style, disableBottom = false }: any) {
  const insets = useSafeAreaInsets();
  
  // Rely strictly on Safe Area Insets. Android handles its non-translucent status bar automatically.
  const topPadding = insets.top;
  
  const bottomPadding = disableBottom ? 0 : insets.bottom;
  
  return (
    <View style={[{ flex: 1, paddingTop: topPadding, paddingBottom: bottomPadding }, style]}>
      {children}
    </View>
  );
}
