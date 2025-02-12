import { View } from 'react-native';
import { Text, Portal, Modal, List, Switch } from 'react-native-paper';
import { Audio } from 'expo-av';
import { useState, useEffect } from 'react';

type Soundscape = {
  id: string;
  name: string;
  icon: string;
};

const SOUNDSCAPES: Soundscape[] = [
  { id: 'white-noise', name: 'White Noise', icon: 'waves' },
  { id: 'rain', name: 'Rain', icon: 'weather-rainy' },
  { id: 'forest', name: 'Forest', icon: 'tree' },
  { id: 'cafe', name: 'Cafe', icon: 'coffee' },
];

type SoundscapeSelectorProps = {
  visible: boolean;
  onDismiss: () => void;
};

export default function SoundscapeSelector({ visible, onDismiss }: SoundscapeSelectorProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [activeSoundscape, setActiveSoundscape] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const toggleSoundscape = async (soundscape: Soundscape) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      if (activeSoundscape !== soundscape.id) {
        // For now, use a single sound for all soundscapes
        const { sound: newSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/notification.wav'),
          { isLooping: true, volume: 0.5 }
        );
        await newSound.playAsync();
        setSound(newSound);
        setActiveSoundscape(soundscape.id);
      } else {
        setActiveSoundscape(null);
      }
    } catch (error) {
      console.error('Error playing soundscape:', error);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 20,
          margin: 20,
          borderRadius: 8,
        }}
      >
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>
          Soundscapes
        </Text>

        {SOUNDSCAPES.map((soundscape) => (
          <List.Item
            key={soundscape.id}
            title={soundscape.name}
            left={(props) => <List.Icon {...props} icon={soundscape.icon} />}
            right={() => (
              <Switch
                value={activeSoundscape === soundscape.id}
                onValueChange={() => toggleSoundscape(soundscape)}
              />
            )}
          />
        ))}

        <Text variant="bodySmall" style={{ marginTop: 8, color: 'gray' }}>
          Note: More soundscapes coming soon!
        </Text>
      </Modal>
    </Portal>
  );
} 