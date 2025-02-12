import { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Portal, Modal, Text } from 'react-native-paper';

type SessionNotesProps = {
  visible: boolean;
  onDismiss: () => void;
  onSave: (notes: string) => void;
  initialNotes?: string;
};

export default function SessionNotes({
  visible,
  onDismiss,
  onSave,
  initialNotes = '',
}: SessionNotesProps) {
  const [notes, setNotes] = useState(initialNotes);

  const handleSave = () => {
    onSave(notes);
    onDismiss();
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
          Session Notes
        </Text>

        <TextInput
          mode="outlined"
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          style={{ marginBottom: 16 }}
          placeholder="Record your thoughts, progress, or challenges..."
        />

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button mode="contained" onPress={handleSave}>
            Save
          </Button>
        </View>
      </Modal>
    </Portal>
  );
} 