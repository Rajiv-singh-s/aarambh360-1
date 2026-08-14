const fs = require('fs');
const path = require('path');
const dir = 'apps/mobile/src/screens';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => path.join(dir, f));
files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  if (!code.includes('import { SafeAreaView } from "react-native-safe-area-context";')) {
     code = `import { SafeAreaView } from "react-native-safe-area-context";\n` + code;
     fs.writeFileSync(f, code);
     console.log('Fixed ' + f);
  }
});
