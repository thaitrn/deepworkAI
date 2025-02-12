import { View } from 'react-native';
import { Text, Button, Portal, Modal, SegmentedButtons, Switch } from 'react-native-paper';

type FocusSettingsProps = {
  visible: boolean;
  onDismiss: () => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  soundEnabled: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
};

export default function FocusSettings({
  visible,
  onDismiss,
  duration,
  onDurationChange,
  soundEnabled,
  onSoundEnabledChange,
}: FocusSettingsProps) {
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
          Focus Settings
        </Text>

        <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
          Timer Duration
        </Text>
        <SegmentedButtons
          value={String(duration)}
          onValueChange={(value) => onDurationChange(Number(value))}
          buttons={[
            { value: '1500', label: '25m' },
            { value: '3000', label: '50m' },
            { value: '2700', label: '45m' },
          ]}
          style={{ marginBottom: 24 }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Text variant="bodyMedium">Sound Notifications</Text>
          <Switch value={soundEnabled} onValueChange={onSoundEnabledChange} />
        </View>

        <Button mode="contained" onPress={onDismiss}>
          Done
        </Button>
      </Modal>
    </Portal>
  );
} 