import { View, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, TextInput, Button, useTheme, Portal, Snackbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { getTask, updateTask } from '@/services/tasks';
import { Task } from '@/types';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { DeadlinePicker } from '@/components/DeadlinePicker';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const theme = useTheme();
  const descriptionRef = useRef<TextInput>(null);

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      const taskData = await getTask(id as string);
      setTask(taskData);
      setTitle(taskData.title);
      setDescription(taskData.description || '');
      setPriority(taskData.priority === 3 ? 'high' : taskData.priority === 2 ? 'medium' : 'low');
      setDeadline(taskData.deadline ? new Date(taskData.deadline) : null);
    } catch (error) {
      setError('Failed to load task');
      console.error('Error loading task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!task) return;
    try {
      setSaving(true);
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority: priority === 'high' ? 3 : priority === 'medium' ? 2 : 1,
        deadline: deadline?.toISOString() || null,
      });
      setSuccess('Task updated successfully');
      
      // Give time for the success message to show
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back
      router.back();
    } catch (error) {
      setError('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  if (loading || !task) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
          <Animated.View entering={FadeIn}>
            <TextInput
              mode="outlined"
              label="Title"
              value={title}
              onChangeText={setTitle}
              error={!!error}
              autoFocus={true}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => {
                // Focus description input
                descriptionRef.current?.focus();
              }}
              style={{ marginBottom: error ? 4 : 12 }}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100)}>
            <TextInput
              ref={descriptionRef}
              mode="outlined"
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              style={{ marginBottom: 24 }}
            />

            <Text style={{ marginBottom: 8, color: '#666' }}>Priority</Text>
            <View style={{ 
              flexDirection: 'row',
              backgroundColor: '#f0f0f0',
              borderRadius: 28,
              padding: 4,
              marginBottom: 24,
            }}>
              {(['low', 'medium', 'high'] as const).map((p) => (
                <Button
                  key={p}
                  mode={priority === p ? 'contained' : 'text'}
                  onPress={() => setPriority(p)}
                  style={{
                    flex: 1,
                    borderRadius: 24,
                    marginHorizontal: 2,
                  }}
                  contentStyle={{ height: 40 }}
                  labelStyle={{ fontSize: 14 }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Button>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)}>
            <DeadlinePicker
              value={deadline}
              onChange={setDeadline}
            />
          </Animated.View>

          <View style={{ flex: 1 }} />

          <Animated.View entering={FadeInDown.delay(300)}>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={!title.trim() || saving}
              style={{
                borderRadius: 28,
                marginBottom: 16,
              }}
              contentStyle={{ height: 56 }}
            >
              Save Changes
            </Button>
          </Animated.View>
        </View>

        <Portal>
          <Snackbar
            visible={!!error}
            onDismiss={() => setError('')}
            duration={3000}
            style={{ backgroundColor: theme.colors.error }}
          >
            {error}
          </Snackbar>

          <Snackbar
            visible={!!success}
            onDismiss={() => setSuccess('')}
            duration={3000}
            style={{ backgroundColor: theme.colors.primary }}
          >
            {success}
          </Snackbar>
        </Portal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
} 