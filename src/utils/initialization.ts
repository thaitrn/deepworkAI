import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding
export const initApp = async () => {
  try {
    await SplashScreen.preventAutoHideAsync();
  } catch (e) {
    console.warn('Error preventing splash screen auto-hide:', e);
  }
};

// Hide the splash screen
export const hideSplashScreen = async () => {
  try {
    await SplashScreen.hideAsync();
  } catch (e) {
    console.warn('Error hiding splash screen:', e);
  }
}; 