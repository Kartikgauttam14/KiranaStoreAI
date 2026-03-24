import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="role-select" />
      <Stack.Screen name="phone-input" />
      <Stack.Screen name="otp-verify" />
    </Stack>
  );
}
