import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/Loading';
import { useAsync } from '@/hooks/useAsync';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { Colors, Typography, Spacing } from '@/constants/colors';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isLoading, setIsLoading] = useState(false);

  // Get user profile
  const {
    data: profileData,
    loading: profileLoading,
    refetch: refetchProfile,
  } = useAsync(() => authService.getProfile(), {});

  const userProfile = profileData || user;

  useFocusEffect(
    React.useCallback(() => {
      refetchProfile();
    }, [refetchProfile])
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      {
        text: 'Logout',
        onPress: () => {
          logout();
          navigation.navigate('Auth' as never);
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as never);
  };

  const handleAddresses = () => {
    navigation.navigate('Addresses' as never);
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'This is KiranaAI - Your local grocery delivery app. We respect your privacy and data security.',
      [{ text: 'OK' }]
    );
  };

  const handleTerms = () => {
    Alert.alert(
      'Terms & Conditions',
      'By using KiranaAI, you agree to our terms and conditions.',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About KiranaAI',
      'KiranaAI v1.0.0\n\nYour trusted local grocery delivery partner powered by AI-driven demand forecasting.',
      [{ text: 'OK' }]
    );
  };

  if (profileLoading && !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  const initials = userProfile?.name
    ? userProfile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 My Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileCardContent}>
            <Avatar initials={initials} size="large" />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile?.name || 'User'}
              </Text>
              <Text style={styles.profilePhone}>
                {userProfile?.phone || 'N/A'}
              </Text>
              <Text
                style={[
                  styles.profileRole,
                  {
                    color:
                      userProfile?.role === 'owner'
                        ? Colors.warning
                        : Colors.primary,
                  },
                ]}
              >
                {userProfile?.role === 'owner'
                  ? '🏪 Store Owner'
                  : '👤 Customer'}
              </Text>
            </View>
          </View>

          <Button
            label="Edit Profile"
            size="small"
            onPress={handleEditProfile}
            fullWidth
            style={{ marginTop: Spacing.md }}
          />
        </Card>

        {/* Settings Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>

          {/* Addresses */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleAddresses}
          >
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemIcon}>📍</Text>
              <View>
                <Text style={styles.settingItemLabel}>Saved Addresses</Text>
                <Text style={styles.settingItemValue}>Manage delivery addresses</Text>
              </View>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </TouchableOpacity>

          {/* Language */}
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemIcon}>🌐</Text>
              <Text style={styles.settingItemLabel}>Language</Text>
            </View>
            <View style={styles.languageButtons}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'en' && styles.languageButtonActive,
                ]}
                onPress={() => setLanguage('en')}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === 'en' &&
                      styles.languageButtonTextActive,
                  ]}
                >
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'hi' && styles.languageButtonActive,
                ]}
                onPress={() => setLanguage('hi')}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === 'hi' &&
                      styles.languageButtonTextActive,
                  ]}
                >
                  HI
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications */}
          <View style={[styles.settingItem, styles.settingItemWithSwitch]}>
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemIcon}>🔔</Text>
              <View>
                <Text style={styles.settingItemLabel}>Notifications</Text>
                <Text style={styles.settingItemValue}>Push notifications</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </Card>

        {/* More Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>ℹ️ More</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handlePrivacy}
          >
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemIcon}>🔒</Text>
              <Text style={styles.settingItemLabel}>Privacy Policy</Text>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleTerms}
          >
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemIcon}>📋</Text>
              <Text style={styles.settingItemLabel}>Terms & Conditions</Text>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleAbout}
          >
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemIcon}>ℹ️</Text>
              <Text style={styles.settingItemLabel}>About KiranaAI</Text>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            label={isLoading ? 'Logging Out...' : 'Logout'}
            variant="secondary"
            onPress={handleLogout}
            disabled={isLoading}
            fullWidth
          />
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>KiranaAI v1.0.0</Text>
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
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  profileCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.h4.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profilePhone: {
    fontSize: Typography.body2.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  profileRole: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  sectionCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.h4.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingItemWithSwitch: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  settingItemIcon: {
    fontSize: 20,
  },
  settingItemLabel: {
    fontSize: Typography.body2.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  settingItemValue: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  settingItemArrow: {
    fontSize: Typography.h3.fontSize,
    color: Colors.textSecondary,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  languageButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  languageButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  languageButtonText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  languageButtonTextActive: {
    color: Colors.white,
  },
  logoutContainer: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  versionText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
});
