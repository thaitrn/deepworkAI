import { View, Pressable } from 'react-native';
import { Card, Text, useTheme, Surface } from 'react-native-paper';
import { Task } from '@/types';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, SlideOutRight, Layout } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Confetti } from './Confetti';
import { IconButton } from 'react-native-paper';

export function TaskItem({ task, onPress, onComplete }: { 
  task: Task; 
  onPress: () => void;
  onComplete?: () => void;
}) {
  const theme = useTheme();
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return '#ffebee'; // High - Light red
      case 2: return '#fff3e0'; // Medium - Light orange
      default: return '#e8f5e9'; // Low - Light green
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 3: return 'High';
      case 2: return 'Medium';
      default: return 'Low';
    }
  };

  const getDeadlineText = (deadline: string) => {
    const today = new Date();
    const taskDate = new Date(deadline);
    
    // Reset time part for date comparison
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) {
      return 'Due Today';
    } else if (taskDate.getTime() < today.getTime()) {
      return 'Overdue';
    } else if (taskDate.getTime() === today.getTime() + 86400000) { // tomorrow
      return 'Due Tomorrow';
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `Due ${months[taskDate.getMonth()]} ${taskDate.getDate()}`;
    }
  };

  const handleComplete = () => {
    setShowConfetti(true);
    // Wait for animation to finish
    setTimeout(() => {
      setShowConfetti(false);
      onComplete?.();
    }, 2000);
  };

  return (
    <Animated.View
      entering={FadeIn}
      exiting={SlideOutRight}
      layout={Layout.springify()}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          gap: 12,
        })}
      >
        <IconButton
          icon={task.status === 'completed' ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
          size={24}
          iconColor={task.status === 'completed' ? theme.colors.primary : theme.colors.outline}
        />
        
        <View style={{ flex: 1 }}>
          <Text 
            variant="bodyLarge"
            style={[
              task.status === 'completed' && { 
                textDecorationLine: 'line-through',
                color: theme.colors.outline,
              }
            ]}
          >
            {task.title}
          </Text>
          
          {task.deadline && (
            <Text 
              variant="bodySmall" 
              style={{ color: theme.colors.error }}
            >
              {getDeadlineText(task.deadline)}
            </Text>
          )}
        </View>

        <IconButton
          icon="dots-vertical"
          size={20}
          iconColor={theme.colors.outline}
        />
      </Pressable>
      <Confetti isActive={showConfetti} />
    </Animated.View>
  );
} 