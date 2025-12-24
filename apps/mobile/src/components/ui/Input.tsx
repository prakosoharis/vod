import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS, THEME } from '../../constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError,
        style,
      ]}>
        {leftIcon && (
          <View style={styles.leftIcon}>{leftIcon}</View>
        )}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={COLORS.cream[200]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[100],
    marginBottom: THEME.spacing.xs,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 126, 116, 0.3)', // cream[200] with 30% opacity
    borderRadius: THEME.borderRadius.md,
    backgroundColor: COLORS.warmCharcoal[100],
    minHeight: 48,
  },
  inputFocused: {
    borderColor: COLORS.accent[500], // Burnt sienna on focus
    backgroundColor: COLORS.warmCharcoal[50], // Slightly lighter when focused
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm + 2,
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[50],
  },
  inputWithLeftIcon: {
    paddingLeft: THEME.spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: THEME.spacing.xs,
  },
  leftIcon: {
    paddingLeft: THEME.spacing.md,
  },
  rightIcon: {
    paddingRight: THEME.spacing.md,
  },
  errorText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.error,
    marginTop: THEME.spacing.xs,
    marginLeft: THEME.spacing.xs,
  },
});

export default Input;