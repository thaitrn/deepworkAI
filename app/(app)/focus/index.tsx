import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Text, Button, ProgressBar, Portal, Dialog, ActivityIndicator, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Task } from '@/types';
import { getTasks, updateTask } from '@/services/tasks';
import { createFocusSession, updateFocusSession } from '@/services/focus';
import { useAuth } from '@/contexts/auth';
import FocusSettings from '@/components/FocusSettings';
import { playNotification, cleanupSound } from '@/utils/sound';
import BreakTimer from '@/components/BreakTimer';
import SessionNotes from '@/components/SessionNotes';
import SoundscapeSelector from '@/components/SoundscapeSelector';

export default function FocusScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const { taskId } = useLocalSearchParams();
  const [task, setTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [duration, setDuration] = useState(25 * 60); // 25 minutes default
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showBreakTimer, setShowBreakTimer] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSoundscapes, setShowSoundscapes] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  useEffect(() => {
    console.log('Focus screen mounted with taskId:', taskId);
  }, []);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    console.log('Loading task with ID:', taskId);
    if (!taskId || !session) {
      setError('Invalid task or session');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const tasks = await getTasks(session.user.id);
      const foundTask = tasks.find(t => t.id === taskId);
      
      if (!foundTask) {
        setError('Task not found');
        return;
      }

      setTask(foundTask);
    } catch (error) {
      console.error('Error loading task:', error);
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = async () => {
    if (!task) return;
    
    try {
      const focusSession = await createFocusSession({
        user_id: session!.user.id,
        task_id: task.id,
        start_time: new Date(),
        duration: timeLeft,
        completed: false,
      });
      setSessionId(focusSession.id);
      setIsActive(true);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const resumeSession = () => {
    setIsActive(true);
  };

  const completeSession = async () => {
    if (!task || !sessionId) return;

    try {
      await updateFocusSession(sessionId, {
        completed: true,
        end_time: new Date(),
        notes: sessionNotes,
      });

      if (timeLeft === 0) {
        await updateTask(task.id, {
          status: 'completed',
        });
        if (soundEnabled) {
          await playNotification();
        }
        setShowBreakTimer(true);
      }
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const handleBreakComplete = () => {
    setShowBreakTimer(false);
    router.replace('/(app)/dashboard');
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(interval);
            setIsActive(false);
            completeSession();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    return () => {
      cleanupSound();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 16 }}>
          {error || 'No task selected'}
        </Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 16, right: 16 }}>
        <IconButton
          icon="cog"
          onPress={() => setShowSettings(true)}
        />
      </View>

      <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 24 }}>
        Focus Mode
      </Text>

      <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
        Current Task: {task.title}
      </Text>

      <Text variant="displayLarge" style={{ textAlign: 'center', marginVertical: 32 }}>
        {formatTime(timeLeft)}
      </Text>

      <ProgressBar
        progress={1 - timeLeft / (25 * 60)}
        style={{ height: 8, marginBottom: 32 }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
        {!isActive ? (
          <Button
            mode="contained"
            onPress={sessionId ? resumeSession : startSession}
            style={{ minWidth: 120 }}
          >
            {sessionId ? 'Resume' : 'Start'}
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={pauseSession}
            style={{ minWidth: 120 }}
          >
            Pause
          </Button>
        )}

        <Button
          mode="outlined"
          onPress={completeSession}
          style={{ minWidth: 120 }}
        >
          Complete
        </Button>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        <Button
          mode="text"
          onPress={() => setShowNotes(true)}
          icon="pencil"
        >
          Notes
        </Button>
        <Button
          mode="text"
          onPress={() => setShowSoundscapes(true)}
          icon="music"
        >
          Sounds
        </Button>
      </View>

      <Portal>
        <Dialog visible={showBreakDialog} onDismiss={handleBreakComplete}>
          <Dialog.Title>Great Work!</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              You've completed your focus session. Take a 5-minute break to:
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8 }}>
              • Stand up and stretch{'\n'}
              • Drink some water{'\n'}
              • Rest your eyes{'\n'}
              • Take deep breaths
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleBreakComplete}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FocusSettings
        visible={showSettings}
        onDismiss={() => setShowSettings(false)}
        duration={duration}
        onDurationChange={(newDuration) => {
          setDuration(newDuration);
          setTimeLeft(newDuration);
        }}
        soundEnabled={soundEnabled}
        onSoundEnabledChange={setSoundEnabled}
      />

      <BreakTimer
        visible={showBreakTimer}
        onComplete={handleBreakComplete}
        soundEnabled={soundEnabled}
      />

      <SessionNotes
        visible={showNotes}
        onDismiss={() => setShowNotes(false)}
        onSave={setSessionNotes}
        initialNotes={sessionNotes}
      />

      <SoundscapeSelector
        visible={showSoundscapes}
        onDismiss={() => setShowSoundscapes(false)}
      />
    </View>
  );
} 