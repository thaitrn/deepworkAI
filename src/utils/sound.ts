import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';

let sound: Audio.Sound | null = null;

export async function playNotification() {
  try {
    if (sound) {
      await sound.unloadAsync();
    }
    
    const { sound: newSound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/notification.wav'),
      { shouldPlay: true }
    );
    sound = newSound;

    // Unload after playing
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish) {
        await sound?.unloadAsync();
        sound = null;
      }
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

export async function cleanupSound() {
  if (sound) {
    await sound.unloadAsync();
    sound = null;
  }
} 