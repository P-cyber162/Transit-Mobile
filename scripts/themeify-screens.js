/**
 * Converts screens that import static `colors` from theme to use useThemeColors + makeStyles.
 */
const fs = require('fs');
const path = require('path');

const appRoot = path.join(__dirname, '..', 'app');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.tsx') && !entry.name.startsWith('_')) out.push(full);
  }
  return out;
}

function themeDepth(file) {
  // count path segments under app/
  const rel = path.relative(appRoot, file).split(path.sep);
  // e.g. (tabs)/home.tsx -> ../../../hooks
  // (app)/more/settings -> from app/(app)/more -> need ../../../../? 
  // file is under app/(app)/(tabs)/home.tsx -> depth 3 from app -> hooks at ../../../../hooks? 
  // From app/(app)/(tabs)/home.tsx: ../ = (app), ../../ = app, ../../../ = root. So ../../../hooks
  return rel.length; // number of segments including filename
}

const files = walk(appRoot);
for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes("from '") && !src.includes('from "')) continue;
  if (!/import\s*\{[^}]*\bcolors\b[^}]*\}\s*from\s*['"][^'"]*theme['"]/.test(src)) {
    console.log('skip (no colors import):', path.relative(appRoot, file));
    continue;
  }
  if (src.includes('useThemeColors')) {
    console.log('skip (already themed):', path.relative(appRoot, file));
    continue;
  }

  const rel = path.relative(appRoot, file).split(path.sep);
  const ups = '../'.repeat(rel.length);
  const hooksImport = `${ups}hooks/useThemeColors`;

  // Ensure React imports useMemo
  if (/import React,\s*\{([^}]*)\}\s*from\s*['"]react['"]/.test(src)) {
    src = src.replace(/import React,\s*\{([^}]*)\}\s*from\s*['"]react['"]/, (m, inner) => {
      if (inner.includes('useMemo')) return m;
      return `import React, { ${inner.trim().replace(/,$/, '')}, useMemo } from 'react'`;
    });
  } else if (/import React\s*from\s*['"]react['"]/.test(src)) {
    src = src.replace(/import React\s*from\s*['"]react['"]/, "import React, { useMemo } from 'react'");
  } else if (/import\s*\{([^}]*)\}\s*from\s*['"]react['"]/.test(src)) {
    src = src.replace(/import\s*\{([^}]*)\}\s*from\s*['"]react['"]/, (m, inner) => {
      if (inner.includes('useMemo')) return m;
      return `import { ${inner.trim().replace(/,$/, '')}, useMemo } from 'react'`;
    });
  }

  // Rewrite colors import
  src = src.replace(
    /import\s*\{([^}]*)\}\s*from\s*(['"][^'"]*theme['"])/,
    (m, inner, from) => {
      const parts = inner.split(',').map((s) => s.trim()).filter(Boolean);
      const kept = parts.filter((p) => p !== 'colors');
      const lines = [];
      if (kept.length) lines.push(`import { ${kept.join(', ')} } from ${from}`);
      lines.push(`import { useThemeColors } from '${hooksImport}'`);
      return lines.join(';\n');
    }
  );

  // Find default export function and inject colors + styles
  const fnMatch = src.match(/export default function\s+(\w+)\s*\(/);
  if (!fnMatch) {
    console.log('skip (no default function):', path.relative(appRoot, file));
    continue;
  }

  // Convert `const styles = StyleSheet.create({...});` at bottom to makeStyles
  const stylesIdx = src.lastIndexOf('const styles = StyleSheet.create');
  if (stylesIdx === -1) {
    console.log('skip (no StyleSheet):', path.relative(appRoot, file));
    continue;
  }

  // Find matching closing }); for StyleSheet.create
  let i = stylesIdx + 'const styles = StyleSheet.create'.length;
  // advance to first {
  while (i < src.length && src[i] !== '{') i++;
  let depth = 0;
  let end = -1;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') {
      depth--;
      if (depth === 0) {
        // expect );
        end = j;
        break;
      }
    }
  }
  if (end === -1) {
    console.log('skip (unbalanced styles):', path.relative(appRoot, file));
    continue;
  }
  // include trailing );
  let closeEnd = end + 1;
  while (closeEnd < src.length && /[\s;)]/.test(src[closeEnd])) {
    if (src[closeEnd] === ';') {
      closeEnd++;
      break;
    }
    closeEnd++;
  }

  const styleBody = src.slice(i, end + 1); // { ... }
  const beforeStyles = src.slice(0, stylesIdx);
  const afterStyles = src.slice(closeEnd);

  const makeStylesBlock = `function makeStyles(colors: ReturnType<typeof useThemeColors>) {\n  return StyleSheet.create(${styleBody});\n}\n`;

  // Inject inside component after opening brace
  const compStart = beforeStyles.indexOf(`export default function ${fnMatch[1]}`);
  const brace = beforeStyles.indexOf('{', compStart);
  let injected = beforeStyles.slice(0, brace + 1) +
    `\n  const colors = useThemeColors();\n  const styles = useMemo(() => makeStyles(colors), [colors]);\n` +
    beforeStyles.slice(brace + 1);

  // Fix handleMarkAllRead in notifications if present - leave as-is; manual later

  const out = injected + afterStyles + '\n' + makeStylesBlock;
  fs.writeFileSync(file, out);
  console.log('themed:', path.relative(appRoot, file));
}
