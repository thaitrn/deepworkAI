import { View, BackHandler, StatusBar } from 'react-native';
import { Text, Button, Portal, Dialog, useTheme, IconButton, SegmentedButtons } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { getTask } from '@/services/tasks';
import { Task } from '@/types';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

// Timer durations in minutes
const DURATIONS = {
  short: { focus: 15, break: 3 },
  medium: { focus: 25, break: 5 },
  long: { focus: 45, break: 10 },
};

type DurationType = keyof typeof DURATIONS;

export default function FocusScreen() {
  const { taskId } = useLocalSearchParams();
  const [task, setTask] = useState<Task | null>(null);
  const [durationType, setDurationType] = useState<DurationType>('medium');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.medium.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  const loadTask = async () => {
    try {
      const taskData = await getTask(taskId as string);
      setTask(taskData);
    } catch (error) {
      console.error('Error loading task:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleDurationChange = (type: DurationType) => {
    setDurationType(type);
    setTimeLeft(DURATIONS[type][isBreak ? 'break' : 'focus'] * 60);
    setIsRunning(false);
  };

  const handleSessionComplete = () => {
    if (!isBreak) {
      setCompletedSessions(prev => prev + 1);
      setIsBreak(true);
      setTimeLeft(DURATIONS[durationType].break * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(DURATIONS[durationType].focus * 60);
    }
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setTimeLeft(DURATIONS[durationType][isBreak ? 'break' : 'focus'] * 60);
    setIsRunning(false);
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  // Handle back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isRunning) {
          setShowExitDialog(true);
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [isRunning])
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      
      {/* Header */}
      <View 
        style={{ 
          backgroundColor: theme.colors.primary,
          paddingTop: StatusBar.currentHeight,
          paddingBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
        }}>
          <IconButton 
            icon="arrow-left" 
            iconColor="white"
            onPress={() => {
              if (isRunning) {
                setShowExitDialog(true);
              } else {
                router.back();
              }
            }}
          />
          <Text variant="titleLarge" style={{ color: 'white' }}>Focus Mode</Text>
          <IconButton 
            icon="cog" 
            iconColor="white"
            onPress={() => setShowSettingsDialog(true)}
          />
        </View>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1, padding: 16 }}>
        <Animated.View 
          entering={FadeInDown.delay(100)}
          style={{ alignItems: 'center', marginTop: 32 }}
        >
          {task && (
            <Text variant="headlineSmall" style={{ marginBottom: 8, textAlign: 'center' }}>
              {task.title}
            </Text>
          )}
          <Text 
            variant="titleMedium" 
            style={{ 
              color: theme.colors.primary,
              marginBottom: 32,
              backgroundColor: theme.colors.primaryContainer,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 16,
            }}
          >
            {isBreak ? 'Break Time' : 'Focus Time'}
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={{ alignItems: 'center' }}
        >
          <View
            style={{
              width: 280,
              height: 280,
              borderRadius: 140,
              borderWidth: 12,
              borderColor: theme.colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 32,
              backgroundColor: theme.colors.primaryContainer,
            }}
          >
            <Text style={{ 
              fontSize: 56, 
              fontWeight: 'bold',
              color: theme.colors.primary,
            }}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={{ 
              color: theme.colors.primary,
              marginTop: 8,
            }}>
              {isBreak ? 'Break' : 'Focus'}
            </Text>
          </View>

          <View style={{ 
            backgroundColor: theme.colors.primaryContainer,
            padding: 16,
            borderRadius: 16,
            marginBottom: 32,
          }}>
            <Text variant="titleMedium" style={{ textAlign: 'center' }}>
              Completed Sessions: {completedSessions}
            </Text>
          </View>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.View 
          entering={FadeInDown.delay(300)}
          style={{ gap: 16 }}
        >
          <Button
            mode="contained"
            onPress={handleStartPause}
            style={{ borderRadius: 28 }}
            contentStyle={{ height: 56 }}
          >
            {isRunning ? 'Pause' : 'Start'}
          </Button>

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Button
              mode="outlined"
              onPress={handleReset}
              style={{ flex: 1, borderRadius: 28 }}
              contentStyle={{ height: 56 }}
            >
              Reset
            </Button>
            <Button
              mode="outlined"
              onPress={handleExit}
              style={{ flex: 1, borderRadius: 28 }}
              contentStyle={{ height: 56 }}
            >
              Exit
            </Button>
          </View>
        </Animated.View>
      </View>

      <Portal>
        <Dialog visible={showExitDialog} onDismiss={() => setShowExitDialog(false)}>
          <Dialog.Title>Exit Focus Mode?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {isRunning 
                ? 'Timer is still running. Are you sure you want to exit?' 
                : 'Are you sure you want to exit focus mode?'}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowExitDialog(false)}>Cancel</Button>
            <Button onPress={() => router.back()}>Exit</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showSettingsDialog} onDismiss={() => setShowSettingsDialog(false)}>
          <Dialog.Title>Timer Settings</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Choose Timer Duration
            </Text>
            <SegmentedButtons
              value={durationType}
              onValueChange={value => handleDurationChange(value as DurationType)}
              buttons={[
                {
                  value: 'short',
                  label: 'Short',
                  icon: 'timer-outline',
                  checkedColor: theme.colors.primary,
                },
                {
                  value: 'medium',
                  label: 'Medium',
                  icon: 'timer',
                  checkedColor: theme.colors.primary,
                },
                {
                  value: 'long',
                  label: 'Long',
                  icon: 'timer-sand',
                  checkedColor: theme.colors.primary,
                },
              ]}
            />
            <View style={{ marginTop: 16 }}>
              <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                Duration Details:
              </Text>
              <Text style={{ color: '#666' }}>
                Focus: {DURATIONS[durationType].focus} minutes{'\n'}
                Break: {DURATIONS[durationType].break} minutes
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSettingsDialog(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
} 