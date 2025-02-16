import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/auth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { verifyDatabaseStructure } from '@/services/database';
import { theme } from '@/theme';
import { View } from 'react-native';

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await verifyDatabaseStructure();
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PaperProvider theme={theme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen 
                name="(auth)" 
                options={{ 
                  animation: 'slide_from_bottom',
                }} 
              />
              <Stack.Screen 
                name="(app)" 
                options={{ 
                  animation: 'fade',
                }} 
              />
            </Stack>
          </PaperProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AuthProvider>
  );
} 