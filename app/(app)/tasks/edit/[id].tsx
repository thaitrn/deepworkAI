import { View, ScrollView } from 'react-native';
import { 
  TextInput, 
  Button, 
  useTheme, 
  HelperText, 
  Text, 
  ActivityIndicator,
  Snackbar 
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Task } from '@/types';
import { getTask, updateTask } from '@/services/tasks';
import { ScreenLayout } from '@/components/ScreenLayout';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Formik } from 'formik';
import * as Yup from 'yup';

interface TaskForm {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  priority: Yup.string().oneOf(['low', 'medium', 'high']).required('Priority is required'),
  deadline: Yup.date().nullable(),
});

interface ApiError {
  code?: string;
  message: string;
  details?: unknown;
}

export default function TaskEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTask = async () => {
      try {
        const fetchedTask = await getTask(id);
        setTask(fetchedTask);
      } catch (error) {
        console.error('Error loading task:', error);
        setError('Failed to load task');
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  const handleSubmit = useCallback(async (values: TaskForm) => {
    if (!task) return;

    try {
      setSaving(true);
      const updatedTask = await updateTask(task.id, {
        title: values.title.trim(),
        description: values.description.trim(),
        priority: values.priority,
        deadline: values.deadline ? values.deadline.toISOString() : null,
      });

      console.log('Task updated successfully:', updatedTask);
      router.back();
    } catch (err) {
      const error = err as ApiError;
      console.error('Error updating task:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });

      // Show specific error messages based on error type
      if (error.code === 'PGRST204') {
        setError('Database schema error. Please contact support.');
      } else if (error.code === '23505') {
        setError('A task with this title already exists.');
      } else if (error.code === '23502') {
        setError('Please fill in all required fields.');
      } else {
        setError(error.message || 'Failed to save changes. Please try again.');
      }
      setSaving(false);
    }
  }, [task, router]);

  if (loading || !task) {
    return (
      <ScreenLayout title="Edit Task">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  const initialValues: TaskForm = {
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    deadline: task.deadline ? new Date(task.deadline) : undefined,
  };

  return (
    <ScreenLayout
      title="Edit Task"
    >
      <ScrollView 
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <View style={{ padding: 16, gap: 16 }}>
              <View>
                <TextInput
                  label="Title"
                  value={values.title}
                  onChangeText={handleChange('title')}
                  onBlur={handleBlur('title')}
                  error={touched.title && !!errors.title}
                  style={{ backgroundColor: theme.colors.surface }}
                />
                <HelperText type="error" visible={touched.title && !!errors.title}>
                  {errors.title}
                </HelperText>
              </View>

              <View>
                <TextInput
                  label="Description"
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  multiline
                  numberOfLines={4}
                  style={{ backgroundColor: theme.colors.surface }}
                />
              </View>

              <View>
                <Text 
                  variant="bodyMedium" 
                  style={{ 
                    marginBottom: 8, 
                    color: theme.colors.outline 
                  }}
                >
                  Priority
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <Button
                      key={p}
                      mode={values.priority === p ? 'contained' : 'outlined'}
                      onPress={() => setFieldValue('priority', p)}
                      style={{ flex: 1 }}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Button>
                  ))}
                </View>
              </View>

              <View>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  icon="calendar"
                >
                  {values.deadline ? format(values.deadline, 'PPP') : 'Set Deadline'}
                </Button>
                {showDatePicker && (
                  <DateTimePicker
                    value={values.deadline || new Date()}
                    mode="date"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) {
                        setFieldValue('deadline', date);
                      }
                    }}
                  />
                )}
              </View>

              <View style={{ gap: 12, marginTop: 24 }}>
                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  loading={saving}
                  disabled={saving}
                >
                  Save Changes
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => router.back()}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        action={{
          label: 'Dismiss',
          onPress: () => setError(''),
        }}
      >
        {error}
      </Snackbar>
    </ScreenLayout>
  );
} 