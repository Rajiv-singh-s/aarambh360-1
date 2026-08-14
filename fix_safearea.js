const fs = require('fs');
const path = require('path');
const dir = 'apps/mobile/src/screens';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => path.join(dir, f));
files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  if (code.includes('import { SafeAreaView } from "react-native-safe-area-context";')) return;
  if (!code.includes('SafeAreaView')) return;
  code = code.replace(/SafeAreaView,\s*/g, '');
  code = code.replace(/(import\s+.*?['"]react-native['"];)/, '$1\nimport { SafeAreaView } from "react-native-safe-area-context";');
  fs.writeFileSync(f, code);
  console.log('Fixed ' + f);
});
