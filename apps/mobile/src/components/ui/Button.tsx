import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
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
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: SIZES.radius,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles = {
      small: {
        paddingHorizontal: SIZES.padding,
        paddingVertical: 8,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: SIZES.padding * 2,
        paddingVertical: 12,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: SIZES.padding * 2.5,
        paddingVertical: 16,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: disabled ? COLORS.surface : COLORS.primary,
      },
      secondary: {
        backgroundColor: disabled ? COLORS.surface : COLORS.surface,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? COLORS.surface : COLORS.primary,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeStyles = {
      small: {
        fontSize: SIZES.font - 2,
      },
      medium: {
        fontSize: SIZES.font,
      },
      large: {
        fontSize: SIZES.font + 2,
      },
    };

    const variantStyles = {
      primary: {
        color: disabled ? COLORS.textSecondary : COLORS.text,
      },
      secondary: {
        color: disabled ? COLORS.textSecondary : COLORS.text,
      },
      outline: {
        color: disabled ? COLORS.textSecondary : COLORS.primary,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? COLORS.primary : COLORS.text}
          style={{ marginRight: 8 }}
        />
      ) : null}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Additional styles if needed
});

export default Button;