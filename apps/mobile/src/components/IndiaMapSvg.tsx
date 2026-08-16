import React from 'react';
import Svg, { Path, G } from 'react-native-svg';
import indiaData from '../utils/indiaMapData';

interface IndiaMapSvgProps {
  width?: number;
  height?: number;
  selectedId?: string | null;
  targetId?: string | null;
  feedback?: 'correct' | 'wrong' | null;
  onLocationPress?: (id: string) => void;
  isDark?: boolean;
}

export default function IndiaMapSvg({
  width = 300,
  height = 350,
  selectedId,
  targetId,
  feedback,
  onLocationPress,
  isDark = false,
}: IndiaMapSvgProps) {
  
  const getFillColor = (locId: string) => {
    // If the game just gave feedback
    if (feedback && selectedId === locId) {
      return feedback === 'correct' ? '#10b981' : '#ef4444';
    }
    // Show the actual target in yellow if they got it wrong
    if (feedback === 'wrong' && targetId === locId) {
      return '#fbbf24';
    }
    return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  };

  const getStrokeColor = (locId: string) => {
    if (feedback && selectedId === locId) {
      return feedback === 'correct' ? '#047857' : '#b91c1c';
    }
    if (feedback === 'wrong' && targetId === locId) {
      return '#d97706';
    }
    return isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
  };

  return (
    <Svg width={width} height={height} viewBox={indiaData.viewBox}>
      <G>
        {indiaData.locations.map((loc: any) => (
          <Path
            key={loc.id}
            d={loc.path}
            fill={getFillColor(loc.id)}
            stroke={getStrokeColor(loc.id)}
            strokeWidth="1.5"
            onPress={() => onLocationPress?.(loc.id)}
          />
        ))}
      </G>
    </Svg>
  );
}
