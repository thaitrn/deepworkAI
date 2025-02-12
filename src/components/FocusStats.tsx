import { View } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { FocusSession } from '@/types';

type FocusStatsProps = {
  sessions: FocusSession[];
};

export default function FocusStats({ sessions }: FocusStatsProps) {
  const totalTime = sessions.reduce((acc, session) => {
    if (session.completed && session.duration) {
      return acc + session.duration;
    }
    return acc;
  }, 0);

  const completedSessions = sessions.filter(s => s.completed).length;
  const averageTime = completedSessions > 0 ? totalTime / completedSessions : 0;

  return (
    <View style={{ padding: 16 }}>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>
        Focus Statistics
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Card style={{ flex: 1, padding: 16 }}>
          <Text variant="titleLarge">{completedSessions}</Text>
          <Text variant="bodyMedium">Sessions</Text>
        </Card>
        <Card style={{ flex: 1, padding: 16 }}>
          <Text variant="titleLarge">{Math.round(totalTime / 60)}</Text>
          <Text variant="bodyMedium">Minutes</Text>
        </Card>
        <Card style={{ flex: 1, padding: 16 }}>
          <Text variant="titleLarge">{Math.round(averageTime / 60)}</Text>
          <Text variant="bodyMedium">Avg. Minutes</Text>
        </Card>
      </View>
    </View>
  );
} 