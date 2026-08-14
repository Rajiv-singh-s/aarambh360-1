const fs = require('fs');

const filePath = 'src/screens/MainScreen.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add useColorScheme import if missing
if (!content.includes('useColorScheme')) {
  content = content.replace(
    'import {',
    'import { useColorScheme,\n'
  );
}

// 2. Remove top-level color constants
content = content.replace(/\/\/ UI Colors[\s\S]*?const BLUE = "#06b6d4";/, '// UI Colors removed, using dynamic theme now');

// 3. Inject COLORS into the component
const colorSetup = `
  const isDark = useColorScheme() === "dark";
  const COLORS = {
    bgTop: isDark ? "#0b1220" : "#e9f0ff",
    bgBottom: isDark ? "#111b2e" : "#ffffff",
    cardBg: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    cardDim: isDark ? "rgba(255,255,255,0.03)" : "#f1f5f9",
    border: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    textLight: isDark ? "#94a3b8" : "#475569",
    textPrimary: isDark ? "#ffffff" : "#0f172a",
    blue: isDark ? "#06b6d4" : "#0284c7",
    danger: "#ef4444",
  };
  const styles = getStyles(COLORS, isDark);
`;

content = content.replace(
  'export default function MainScreen() {\n  const nav = useNavigation<any>();',
  'export default function MainScreen() {\n  const nav = useNavigation<any>();\n' + colorSetup
);

// 4. Update the LinearGradient colors in the JSX
content = content.replace(/colors=\{\[BG_TOP, BG_BOTTOM\]\}/g, 'colors={[COLORS.bgTop, COLORS.bgBottom]}');
// Replace constants in JSX if they are used inline
content = content.replace(/color=\{BLUE\}/g, 'color={COLORS.blue}');
content = content.replace(/backgroundColor: CARD_BG/g, 'backgroundColor: COLORS.cardBg');
content = content.replace(/color: "#fff"/g, 'color: COLORS.textPrimary');


// 5. Wrap styles in getStyles
content = content.replace(
  'const styles = StyleSheet.create({',
  'const getStyles = (COLORS: any, isDark: boolean) => StyleSheet.create({'
);

// 6. Replace hardcoded colors in StyleSheet
content = content.replace(/BG_TOP/g, 'COLORS.bgTop');
content = content.replace(/BG_BOTTOM/g, 'COLORS.bgBottom');
content = content.replace(/CARD_BG/g, 'COLORS.cardBg');
content = content.replace(/TEXT_LIGHT/g, 'COLORS.textLight');
content = content.replace(/BLUE/g, 'COLORS.blue');
// Replace hardcoded hex colors in the style sheet
content = content.replace(/'#0b1220'/g, 'COLORS.bgTop');
content = content.replace(/'#111b2e'/g, 'COLORS.bgBottom');
content = content.replace(/'#1e293b'/g, 'COLORS.cardBg');
content = content.replace(/'#0f172a'/g, 'COLORS.cardDim');
content = content.replace(/'#334155'/g, 'COLORS.border');
content = content.replace(/'#ffffff'/gi, 'COLORS.textPrimary');
content = content.replace(/'#fff'/gi, 'COLORS.textPrimary');
content = content.replace(/'#ef4444'/gi, 'COLORS.danger');
content = content.replace(/'#94a3b8'/gi, 'COLORS.textLight');
content = content.replace(/'#06b6d4'/gi, 'COLORS.blue');


fs.writeFileSync(filePath, content);
console.log('MainScreen.tsx refactored for dynamic theme!');
