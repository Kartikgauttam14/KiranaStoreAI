import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, Text } from 'react-native';
import '../i18n';
import { useAuthStore } from '@/store/authStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 },
  },
});

// Time to allow Zustand's persist middleware to hydrate from AsyncStorage
const HYDRATION_TIMEOUT_MS = 500;

export default function RootLayout() {
  const { token, user } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Give Zustand persist middleware time to hydrate from AsyncStorage
        await new Promise(resolve => setTimeout(resolve, HYDRATION_TIMEOUT_MS));

        if (__DEV__) {
          console.log('✓ App initialized');
          console.log('Token:', token ? 'exists' : 'null');
          console.log('User role:', user?.role || 'not set');
        }

        setIsReady(true);
      } catch (err: any) {
        console.error('App initialization error:', err);
        setInitError(err.message || 'Initialization failed');
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (initError) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: 'red', fontSize: 16, textAlign: 'center' }}>
            Error: {initError}
          </Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  if (!isReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={{ marginTop: 16, color: '#6C6C70', fontSize: 16 }}>Loading...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack
            screenOptions={{
              headerShown: false,
              animationEnabled: true,
            }}
          >
            {!token ? (
              <Stack.Screen
                name="(auth)"
                options={{
                  title: 'Auth',
                }}
              />
            ) : (
              <>
                <Stack.Screen name="(owner)" />
                <Stack.Screen name="(customer)" />
              </>
            )}
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
