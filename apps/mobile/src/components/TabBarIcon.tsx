import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface TabBarIconProps {
  name: string;
  size: number;
  color: string;
  focused: boolean;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, size, color, focused }) => {
  const getIcon = () => {
    switch (name) {
      case 'home':
        return focused ? '🏠' : '🏡';
      case 'search':
        return focused ? '🔍' : '🔎';
      case 'user':
        return focused ? '👤' : '👥';
      default:
        return '📱';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { fontSize: size, color }]}>
        {getIcon()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});

export default TabBarIcon;