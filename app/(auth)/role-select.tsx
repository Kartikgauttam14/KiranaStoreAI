import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { Colors, Typography, Spacing } from '@/constants/colors';

export default function RoleSelectScreen() {
  const router = useRouter();
  const setRole = useAuthStore((state) => state.user);

  const selectRole = (role: 'STORE_OWNER' | 'CUSTOMER') => {
    // Store role selection (you might want to store this in a separate store)
    // Then navigate to phone input
    router.push('/phone-input');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏪 KiranaAI</Text>
          <Text style={styles.title}>Who are you?</Text>
          <Text style={styles.subtitle}>
            Choose your role to get started
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <Card
            style={styles.card}
            onPress={() => selectRole('STORE_OWNER')}
          >
            <Text style={styles.cardEmoji}>🏪</Text>
            <Text style={styles.cardTitle}>Store Owner</Text>
            <Text style={styles.cardDescription}>
              Manage your kirana store, inventory, and AI forecasts
            </Text>
          </Card>

          <Card
            style={styles.card}
            onPress={() => selectRole('CUSTOMER')}
          >
            <Text style={styles.cardEmoji}>🛍️</Text>
            <Text style={styles.cardTitle}>Customer</Text>
            <Text style={styles.cardDescription}>
              Shop from nearby kirana stores
            </Text>
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.body1.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  card: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  cardEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
