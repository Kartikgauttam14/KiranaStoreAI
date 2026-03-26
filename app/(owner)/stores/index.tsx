import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Colors, Typography } from '@/constants/colors';

export default function StoresScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: Typography.h2.fontSize, fontWeight: '700' }}>
          🏪 My Stores
        </Text>
        <Text style={{ fontSize: Typography.body2.fontSize, color: Colors.textSecondary }}>
          Coming soon...
        </Text>
      </View>
    </SafeAreaView>
  );
}
