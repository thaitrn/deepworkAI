import { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/contexts/auth';
import { getTasks } from '@/services/tasks';
import { getFocusSessions } from '@/services/focus';
import StatsVisualization from '@/components/StatsVisualization';
import FocusStats from '@/components/FocusStats';
import AIInsights from '@/components/AIInsights';

export default function StatsScreen() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, sessionsData] = await Promise.all([
        getTasks(session!.user.id),
        getFocusSessions(session!.user.id),
      ]);
      setTasks(tasksData);
      setFocusSessions(sessionsData);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
          Statistics
        </Text>

        <SegmentedButtons
          value={timeRange}
          onValueChange={value => setTimeRange(value as 'week' | 'month')}
          buttons={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          style={{ marginBottom: 16 }}
        />
      </View>

      <FocusStats sessions={focusSessions} />
      
      <StatsVisualization
        sessions={focusSessions}
        tasks={tasks}
        timeRange={timeRange}
      />

      <AIInsights tasks={tasks} sessions={focusSessions} />
    </ScrollView>
  );
} 