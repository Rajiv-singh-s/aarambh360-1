const fs = require('fs');
const path = require('path');
const dir = 'apps/mobile/src/screens';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => path.join(dir, f));
files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  if (code.includes("import SafeContainer")) return;
  if (!code.includes('SafeAreaView') && !code.includes('SafeContainer')) return;
  
  // Replace SafeAreaView tags
  code = code.replace(/<SafeAreaView/g, '<SafeContainer');
  code = code.replace(/<\/SafeAreaView>/g, '</SafeContainer>');
  
  // Remove old safe area imports
  code = code.replace(/import\s*\{\s*SafeAreaView\s*\}\s*from\s*["']react-native-safe-area-context["'];\n?/g, '');
  code = code.replace(/SafeAreaView,\s*/g, '');
  
  // Add import SafeContainer
  code = `import SafeContainer from '../components/SafeContainer';\n` + code;
  
  fs.writeFileSync(f, code);
  console.log('Fixed ' + f);
});
