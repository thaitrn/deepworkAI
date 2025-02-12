import { View } from 'react-native';
import { Card, Text, List, useTheme } from 'react-native-paper';
import { Task, FocusSession } from '@/types';
import { getProductivityInsights, analyzeFocusPatterns } from '@/services/ai';
import { useState, useEffect } from 'react';

type AIInsightsProps = {
  tasks: Task[];
  sessions: FocusSession[];
};

export default function AIInsights({ tasks, sessions }: AIInsightsProps) {
  const theme = useTheme();
  const [insights, setInsights] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any>(null);

  useEffect(() => {
    loadInsights();
  }, [tasks, sessions]);

  const loadInsights = async () => {
    try {
      const [insightData, patternData] = await Promise.all([
        getProductivityInsights(sessions, tasks),
        analyzeFocusPatterns(sessions),
      ]);
      setInsights(insightData);
      setPatterns(patternData);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>
        AI Insights
      </Text>

      {patterns && (
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium">Your Focus Patterns</Text>
            <List.Item
              title="Best Time of Day"
              description={patterns.bestTimeOfDay}
              left={props => <List.Icon {...props} icon="clock-outline" />}
            />
            <List.Item
              title="Recommended Session Length"
              description={`${patterns.recommendedDuration} minutes`}
              left={props => <List.Icon {...props} icon="timer-outline" />}
            />
            <List.Item
              title="Productive Streak"
              description={`${patterns.productiveStreak} sessions`}
              left={props => <List.Icon {...props} icon="fire" />}
            />
          </Card.Content>
        </Card>
      )}

      {insights.map((insight, index) => (
        <Card
          key={index}
          style={{
            marginBottom: 8,
            backgroundColor:
              insight.type === 'success'
                ? theme.colors.primaryContainer
                : insight.type === 'warning'
                ? theme.colors.errorContainer
                : theme.colors.surfaceVariant,
          }}
        >
          <Card.Content>
            <Text variant="bodyLarge">{insight.message}</Text>
            {insight.actionItem && (
              <Text variant="bodyMedium" style={{ marginTop: 8, opacity: 0.7 }}>
                Tip: {insight.actionItem}
              </Text>
            )}
          </Card.Content>
        </Card>
      ))}
    </View>
  );
} 