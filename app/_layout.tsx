import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/auth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const theme = {
  ...MD3LightTheme,
  // You can customize your theme here
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
  },
};

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen when the app is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PaperProvider theme={theme}>
            <Stack>
              <Stack.Screen
                name="(auth)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(app)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>
          </PaperProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AuthProvider>
  );
} 