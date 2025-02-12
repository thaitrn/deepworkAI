import { useState, useRef } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { TextInput, IconButton, Text, Card, Button } from 'react-native-paper';
import { Task } from '@/types';
import { sendMessage } from '@/services/chat';
import { createTask } from '@/services/tasks';
import { useAuth } from '@/contexts/auth';
import { analyzeTaskText } from '@/services/ai/taskAnalyzer';
import MessageBubble from './chat/MessageBubble';
import SuggestionCard from './chat/SuggestionCard';
import Animated from 'react-native-reanimated';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: any[];
};

type ChatInterfaceProps = {
  tasks: Task[];
  onTaskCreated: () => void;
};

export default function ChatInterface({ tasks, onTaskCreated }: ChatInterfaceProps) {
  const { session } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I can help you manage tasks and stay productive. What would you like to do?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage(input, {
        tasks,
        userId: session!.user.id,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        suggestions: response.suggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (response.action === 'create_task' && response.suggestions?.[0]) {
        const suggestion = response.suggestions[0];
        await createTask({
          title: suggestion.title,
          description: suggestion.description,
          priority: suggestion.priority,
          status: 'pending',
          user_id: session!.user.id,
        });
        onTaskCreated();
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
      scrollViewRef.current?.scrollToEnd();
    }
  };

  const handleSuggestion = async (suggestion: any) => {
    try {
      if (!suggestion.title) return;

      const analysis = analyzeTaskText(suggestion.title);
      const task = await createTask({
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority || analysis.priority,
        status: 'pending',
        user_id: session!.user.id,
      });

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Great! I've created the task "${task.title}" with priority ${task.priority}.`,
        },
      ]);

      onTaskCreated();
    } catch (error) {
      console.error('Error creating task from suggestion:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error creating the task. Please try again.',
        },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((message, index) => (
          <View key={message.id}>
            <MessageBubble
              content={message.content}
              isUser={message.role === 'user'}
              style={{ marginBottom: message.suggestions ? 8 : 16 }}
            />
            {message.suggestions?.map((suggestion, sIndex) => (
              <SuggestionCard
                key={sIndex}
                suggestion={suggestion}
                onAccept={handleSuggestion}
              />
            ))}
          </View>
        ))}
        {loading && (
          <MessageBubble
            content=""
            isUser={false}
            isLoading
            style={{ marginTop: 8 }}
          />
        )}
      </ScrollView>

      <Animated.View
        style={styles.inputContainer}
      >
        <TextInput
          mode="outlined"
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          style={styles.input}
          right={loading ? <TextInput.Icon icon="loading" /> : undefined}
        />
        <IconButton
          icon="send"
          mode="contained"
          onPress={handleSend}
          disabled={!input.trim() || loading}
          style={styles.sendButton}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
  sendButton: {
    alignSelf: 'center',
  },
}); 