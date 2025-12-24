import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, THEME } from '../../constants';

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
      borderRadius: THEME.borderRadius.full, // Pill-shaped like web
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      overflow: 'hidden', // For gradient clipping
    };

    // Size styles using THEME
    const sizeStyles = {
      small: {
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: THEME.spacing.lg,
        paddingVertical: THEME.spacing.md - 4,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: THEME.spacing.xl,
        paddingVertical: THEME.spacing.md,
        minHeight: 52,
      },
    };

    // Variant styles with new color palette
    const variantStyles = {
      primary: {
        // Gradient handled by LinearGradient, no backgroundColor here
        backgroundColor: disabled ? COLORS.warmCharcoal[50] : undefined,
      },
      secondary: {
        backgroundColor: disabled ? COLORS.warmCharcoal[300] : COLORS.warmCharcoal[50],
        ...THEME.shadows.small,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled ? COLORS.cream[300] : COLORS.accent[500],
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
      fontWeight: THEME.typography.fontWeight.semibold,
      textAlign: 'center',
    };

    const sizeStyles = {
      small: {
        fontSize: THEME.typography.fontSize.sm - 2,
      },
      medium: {
        fontSize: THEME.typography.fontSize.md,
      },
      large: {
        fontSize: THEME.typography.fontSize.lg,
      },
    };

    const variantStyles = {
      primary: {
        color: disabled ? COLORS.cream[300] : COLORS.cream[50],
      },
      secondary: {
        color: disabled ? COLORS.cream[300] : COLORS.cream[50],
      },
      outline: {
        color: disabled ? COLORS.cream[300] : COLORS.accent[500],
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  // Content component (with loading indicator and text)
  const ButtonContent = () => (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? COLORS.accent[500] : COLORS.cream[50]}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </>
  );

  // Primary variant uses gradient, others use regular TouchableOpacity
  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={style}
      >
        <LinearGradient
          colors={[COLORS.accent[500], COLORS.accent[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[getButtonStyle(), THEME.shadows.medium]}
        >
          <ButtonContent />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Secondary and Outline variants
  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Additional styles if needed
});

export default Button;