import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Typography, Spacing } from '@/constants/colors';

export default function PhoneInputScreen() {
  const router = useRouter();
  const { sendOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await sendOtp(phone);
      router.push({
        pathname: '/otp-verify',
        params: { phone },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      Alert.alert('Error', err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Enter your mobile number</Text>
            <Text style={styles.subtitle}>
              We'll send you an OTP to verify your phone
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.phoneInputWrapper}>
              <Text style={styles.countryCode}>+91</Text>
              <Input
                placeholder="10-digit phone number"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text.replace(/\D/g, '').slice(0, 10));
                  setError('');
                }}
                keyboardType="phone-pad"
                maxLength={10}
                error={error}
                style={styles.input}
              />
            </View>

            <Button
              label="Send OTP"
              onPress={handleSendOtp}
              loading={loading}
              disabled={phone.length !== 10}
              fullWidth
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Standard message rates may apply
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.body1.fontSize,
    color: Colors.textSecondary,
  },
  form: {
    gap: Spacing.lg,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingLeft: Spacing.md,
    backgroundColor: Colors.white,
  },
  countryCode: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    marginBottom: 0,
  },
  footer: {
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
