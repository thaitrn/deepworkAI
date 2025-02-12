import { View, Dimensions } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { FocusSession, Task } from '@/types';
import { LineChart } from 'react-native-chart-kit';

type StatsVisualizationProps = {
  sessions: FocusSession[];
  tasks: Task[];
  timeRange?: 'week' | 'month';
};

export default function StatsVisualization({ 
  sessions, 
  tasks,
  timeRange = 'week' 
}: StatsVisualizationProps) {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const getDateRangeData = () => {
    const now = new Date();
    const dates: Date[] = [];
    const daysToShow = timeRange === 'week' ? 7 : 30;

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }

    return dates;
  };

  const getFocusTimeData = () => {
    const dates = getDateRangeData();
    return dates.map(date => {
      const daysSessions = sessions.filter(session => {
        const sessionDate = new Date(session.start_time);
        return (
          sessionDate.getDate() === date.getDate() &&
          sessionDate.getMonth() === date.getMonth() &&
          sessionDate.getFullYear() === date.getFullYear()
        );
      });

      const totalMinutes = daysSessions.reduce((acc, session) => {
        if (session.duration) {
          return acc + session.duration / 60;
        }
        return acc;
      }, 0);

      return Math.round(totalMinutes);
    });
  };

  const getCompletedTasksData = () => {
    const dates = getDateRangeData();
    return dates.map(date => {
      const completedTasks = tasks.filter(task => {
        if (!task.updated_at || task.status !== 'completed') return false;
        const taskDate = new Date(task.updated_at);
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        );
      });
      return completedTasks.length;
    });
  };

  const labels = getDateRangeData().map(date => 
    timeRange === 'week' 
      ? date.toLocaleDateString('en-US', { weekday: 'short' })
      : date.getDate().toString()
  );

  const focusTimeData = getFocusTimeData();
  const tasksData = getCompletedTasksData();

  return (
    <View style={{ padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>
        Productivity Insights
      </Text>

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Focus Time (minutes)
        </Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: focusTimeData }],
          }}
          width={screenWidth - 64}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => theme.colors.primary,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </Card>

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Completed Tasks
        </Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: tasksData }],
          }}
          width={screenWidth - 64}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => theme.colors.secondary,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </Card>
    </View>
  );
} 