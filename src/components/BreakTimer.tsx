import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Text, Button, ProgressBar, Portal, Dialog } from 'react-native-paper';
import { playNotification } from '@/utils/sound';

type BreakTimerProps = {
  visible: boolean;
  onComplete: () => void;
  duration?: number; // in seconds, default 5 minutes
  soundEnabled?: boolean;
};

export default function BreakTimer({ 
  visible, 
  onComplete, 
  duration = 5 * 60,
  soundEnabled = true,
}: BreakTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(interval);
            setIsActive(false);
            if (soundEnabled) {
              playNotification();
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, soundEnabled]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onComplete}>
        <Dialog.Title>Break Time</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
            Take a moment to:
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
            • Stand up and stretch{'\n'}
            • Drink some water{'\n'}
            • Rest your eyes{'\n'}
            • Take deep breaths
          </Text>

          <Text variant="displayMedium" style={{ textAlign: 'center', marginVertical: 16 }}>
            {formatTime(timeLeft)}
          </Text>

          <ProgressBar
            progress={1 - timeLeft / duration}
            style={{ height: 8 }}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setIsActive(!isActive)}>
            {isActive ? 'Pause' : 'Resume'}
          </Button>
          <Button onPress={onComplete}>Skip</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
} 