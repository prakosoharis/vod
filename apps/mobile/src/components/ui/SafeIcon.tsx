import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface SafeIconProps {
  name: string;
  size: number;
  color: string;
  style?: any;
  opacity?: number;
}

const SafeIcon: React.FC<SafeIconProps> = ({ name, size, color, style, opacity }) => {
  // Material Community Icons (for specific icons not in Material Icons)
  const communityIcons = [
    'netflix',
    'movie-open',
    'account-circle',
    'account-circle-outline',
  ];

  if (communityIcons.includes(name)) {
    return (
      <MaterialCommunityIcons
        name={name}
        size={size}
        color={color}
        style={[{ opacity: opacity ?? 1 }, style]}
      />
    );
  }

  // Default to Material Icons (most common)
  return (
    <MaterialIcons
      name={name}
      size={size}
      color={color}
      style={[{ opacity: opacity ?? 1 }, style]}
    />
  );
};

export default SafeIcon;
