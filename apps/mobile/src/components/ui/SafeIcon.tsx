import React from 'react';
import { Text } from 'react-native';

interface SafeIconProps {
  name: string;
  size: number;
  color: string;
}

const SafeIcon: React.FC<SafeIconProps> = ({ name, size, color }) => {
  const fallbackIcons: { [key: string]: string } = {
    'home': '🏠',
    'search': '🔍',
    'live-tv': '📺',
    'person': '👤',
    'play-arrow': '▶️',
    'pause': '⏸️',
    'info-outline': 'ℹ️',
    'star': '⭐',
    'close': '❌',
    'movie': '🎬',
    'arrow-back': '←',
    'check': '✓',
    'fullscreen': '⛶',
    'fullscreen-exit': '⛶',
    'skip-next': '⏭️',
    'skip-previous': '⏮️',
    'replay': '🔄',
    'volume-up': '🔊',
    'volume-off': '🔇',
    'lock': '🔒',
  };

  return (
    <Text style={{ fontSize: size, color: color, textAlign: 'center', lineHeight: size }}>
      {fallbackIcons[name] || '❓'}
    </Text>
  );
};

export default SafeIcon;