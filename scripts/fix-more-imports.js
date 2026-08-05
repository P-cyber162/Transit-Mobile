const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'app', '(app)', 'more');
for (const f of fs.readdirSync(root).filter((x) => x.endsWith('.tsx'))) {
  const p = path.join(root, f);
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  s = s.replace(
    /from ['"]\.\.\/\.\.\/(theme|store|services|components|hooks|types|utils)/g,
    (m, pkg, offset, str) => {
      const quote = str[str.indexOf('from ', offset) + 5] === '"' ? '"' : "'";
      // simpler: just replace the path segment
      return m.replace('../../', '../../../');
    }
  );
  // Direct replace is safer
  s = before.replace(/\.\.\/\.\.\/(theme|store|services|components|hooks|types|utils)/g, '../../../$1');
  if (s !== before) {
    fs.writeFileSync(p, s);
    console.log('fixed', f);
  } else {
    console.log('no change', f);
  }
}
