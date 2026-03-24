import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/colors';

interface CardProps {
  style?: ViewStyle;
  onPress?: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  padding?: number;
  borderRadius?: number;
}

export const Card: React.FC<CardProps> = ({
  style,
  onPress,
  title,
  subtitle,
  children,
  padding = Spacing.md,
  borderRadius = 8,
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.container,
        {
          padding,
          borderRadius,
          backgroundColor: Colors.cardBackground,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
});
