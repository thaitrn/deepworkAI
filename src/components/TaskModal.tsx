import { useState } from 'react';
import { Modal, Portal } from 'react-native-paper';
import { View } from 'react-native';
import { Button, TextInput, Text, SegmentedButtons } from 'react-native-paper';
import { Task } from '@/types';

type TaskModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialTask?: Partial<Task>;
};

export default function TaskModal({ visible, onDismiss, onSubmit, initialTask }: TaskModalProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [status, setStatus] = useState<Task['status']>(initialTask?.status || 'pending');
  const [priority, setPriority] = useState<string>(String(initialTask?.priority || 1));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onSubmit({
        title,
        description,
        status,
        priority: parseInt(priority, 10),
        user_id: initialTask?.user_id!,
      });
      onDismiss();
    } catch (error) {
      console.error('Error submitting task:', error);
      // TODO: Show error message
    } finally {
      setLoading(false);
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
          {initialTask ? 'Edit Task' : 'New Task'}
        </Text>

        <TextInput
          mode="outlined"
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={{ marginBottom: 16 }}
        />

        <TextInput
          mode="outlined"
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ marginBottom: 16 }}
        />

        <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Status</Text>
        <SegmentedButtons
          value={status}
          onValueChange={value => setStatus(value as Task['status'])}
          buttons={[
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
          ]}
          style={{ marginBottom: 16 }}
        />

        <TextInput
          mode="outlined"
          label="Priority (1-5)"
          value={priority}
          onChangeText={setPriority}
          keyboardType="numeric"
          style={{ marginBottom: 24 }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={!title || loading}
          >
            {initialTask ? 'Update' : 'Create'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
} 