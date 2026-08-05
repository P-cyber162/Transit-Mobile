// ============================================================
// components/common/AnimatedNumber.tsx — Number counter component
// Ported from AnimatedNumber.jsx in web app
// ============================================================

import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';
import { colors } from '../../theme';

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  style?: TextStyle;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  suffix = '',
  prefix = '',
  style,
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 800; // ms
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      setDisplayValue(current);

      if (progress >= 1) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <Text style={[{ color: colors.textPrimary, fontWeight: '700' }, style]}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </Text>
  );
};
