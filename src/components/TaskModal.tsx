import { useState } from 'react';
import { View, Platform } from 'react-native';
import { Modal, Portal, TextInput, Button, Text, SegmentedButtons, useTheme } from 'react-native-paper';
import { Task } from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';

type TaskModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialTask?: Task;
};

type Priority = 'low' | 'medium' | 'high';

// Add a simple date formatter function as fallback
const formatDate = (date: Date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export default function TaskModal({ visible, onDismiss, onSubmit, initialTask }: TaskModalProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'medium');
  const [deadline, setDeadline] = useState<Date | null>(initialTask?.deadline ? new Date(initialTask.deadline) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status: 'pending',
        priority: priority === 'low' ? 1 : priority === 'medium' ? 2 : 3,
        deadline: deadline?.toISOString() || null,
        user_id: initialTask?.user_id || '',
      });
      onDismiss();
    } catch (error) {
      setError('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const showDatePickerModal = () => {
    if (Platform.OS === 'android') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(true);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: 20,
          borderRadius: 8,
          padding: 0,
        }}
      >
        <View style={{ padding: 16 }}>
          <Text variant="headlineSmall" style={{ marginBottom: 24 }}>
            New Task
          </Text>

          <TextInput
            mode="flat"
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            error={!!error}
            style={{ marginBottom: 16, backgroundColor: 'transparent' }}
          />

          <TextInput
            mode="flat"
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ marginBottom: 24, backgroundColor: 'transparent' }}
          />

          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Priority</Text>
          <SegmentedButtons
            value={priority}
            onValueChange={value => setPriority(value as Priority)}
            buttons={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            style={{ marginBottom: 24 }}
          />

          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Deadline</Text>
          <Button
            mode="outlined"
            onPress={showDatePickerModal}
            icon="calendar"
            style={{ marginBottom: 24 }}
          >
            {deadline ? formatDate(deadline) : 'No deadline set'}
          </Button>

          {showDatePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="date"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showDatePicker && Platform.OS === 'ios' && (
            <View style={{ 
              backgroundColor: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
              marginBottom: 16 
            }}>
              <DateTimePicker
                value={deadline || new Date()}
                mode="date"
                onChange={handleDateChange}
                minimumDate={new Date()}
                display="spinner"
              />
              <Button onPress={() => setShowDatePicker(false)}>
                Done
              </Button>
            </View>
          )}

          {error ? (
            <Text style={{ color: 'red', marginBottom: 16 }}>{error}</Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !title.trim()}
            style={{
              marginTop: 'auto',
              backgroundColor: theme.colors.primary,
              borderRadius: 8,
              paddingVertical: 8,
            }}
          >
            Save Task
          </Button>
        </View>
      </Modal>
    </Portal>
  );
} 