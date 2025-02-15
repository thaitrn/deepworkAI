import { View, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, TextInput, Button, useTheme, Portal, Modal } from 'react-native-paper';
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { createTask } from '@/services/tasks';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { DeadlinePicker } from '@/components/DeadlinePicker';

export default function NewTaskScreen() {
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const theme = useTheme();
  const descriptionRef = useRef<TextInput>(null);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await createTask({
        title: title.trim(),
        description: description.trim(),
        status: 'pending',
        priority: priority === 'low' ? 1 : priority === 'medium' ? 2 : 3,
        deadline: deadline?.toISOString() || null,
        user_id: session!.user.id,
      });
      router.back();
    } catch (error) {
      console.error('Error creating task:', error);
      setErrors({ submit: 'Failed to create task. Please try again.' });
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

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
          <Animated.View 
            entering={FadeIn}
            style={{ padding: 16, flex: 1 }}
          >
            <Animated.View entering={FadeInDown.delay(100)}>
              <TextInput
                mode="outlined"
                label="Title"
                value={title}
                onChangeText={setTitle}
                error={!!errors.title}
                autoFocus={true}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  // Focus description input
                  descriptionRef.current?.focus();
                }}
                style={{ marginBottom: errors.title ? 4 : 12 }}
              />
              {errors.title && (
                <Text style={{ color: theme.colors.error, fontSize: 12, marginBottom: 12 }}>
                  {errors.title}
                </Text>
              )}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200)}>
              <TextInput
                ref={descriptionRef}
                mode="outlined"
                label="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={{ marginBottom: errors.description ? 4 : 12 }}
              />
              {errors.description && (
                <Text style={{ color: theme.colors.error, fontSize: 12, marginBottom: 12 }}>
                  {errors.description}
                </Text>
              )}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300)}>
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
                    buttonColor={priority === p ? (
                      p === 'high' ? '#ef5350' :
                      p === 'medium' ? '#fb8c00' :
                      '#66bb6a'
                    ) : undefined}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Button>
                ))}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)}>
              <DeadlinePicker
                value={deadline}
                onChange={setDeadline}
                format="long"
                includeTime={true}
                minDate={new Date()}
                maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 90 days from now
              />
            </Animated.View>

            <View style={{ flex: 1 }} />

            {errors.submit && (
              <Text style={{ color: theme.colors.error, textAlign: 'center', marginBottom: 8 }}>
                {errors.submit}
              </Text>
            )}

            <Animated.View entering={FadeInDown.delay(500)}>
              <Button
                mode="contained"
                onPress={handleSave}
                loading={loading}
                disabled={!title.trim() || loading}
                style={{
                  borderRadius: 28,
                  marginBottom: 16,
                  backgroundColor: theme.colors.primary,
                }}
                contentStyle={{ height: 56 }}
              >
                Save Task
              </Button>
            </Animated.View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
} 