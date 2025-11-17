import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  DimensionValue,
} from 'react-native';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    };

    // Size styles
    let sizeStyle: ViewStyle;
    switch (size) {
      case 'small':
        sizeStyle = {
          paddingHorizontal: 12,
          paddingVertical: 8,
          minHeight: 36,
        };
        break;
      case 'large':
        sizeStyle = {
          paddingHorizontal: 24,
          paddingVertical: 16,
          minHeight: 56,
        };
        break;
      default: // medium
        sizeStyle = {
          paddingHorizontal: 16,
          paddingVertical: 12,
          minHeight: 48,
        };
    }

    // Variant styles
    let variantStyle: ViewStyle;
    switch (variant) {
      case 'secondary':
        variantStyle = {
          backgroundColor: '#6c757d',
        };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: '#007AFF',
        };
        break;
      case 'ghost':
        variantStyle = {
          backgroundColor: 'transparent',
        };
        break;
      default: // primary
        variantStyle = {
          backgroundColor: '#007AFF',
        };
    }

    // Width style
    const widthStyle = fullWidth ? { width: '100%' as DimensionValue } : {};

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      ...widthStyle,
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
    };

    // Size text styles
    let sizeTextStyle: TextStyle;
    switch (size) {
      case 'small':
        sizeTextStyle = { fontSize: 14 };
        break;
      case 'large':
        sizeTextStyle = { fontSize: 18 };
        break;
      default: // medium
        sizeTextStyle = { fontSize: 16 };
    }

    // Variant text styles
    let variantTextStyle: TextStyle;
    switch (variant) {
      case 'outline':
        variantTextStyle = { color: '#007AFF' };
        break;
      case 'ghost':
        variantTextStyle = { color: '#007AFF' };
        break;
      default: // primary, secondary
        variantTextStyle = { color: '#fff' };
    }

    return {
      ...baseTextStyle,
      ...sizeTextStyle,
      ...variantTextStyle,
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#007AFF' : '#fff'}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;