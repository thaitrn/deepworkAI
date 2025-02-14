import { View, Platform, TouchableOpacity } from 'react-native';
import { Button, Portal, Text, useTheme, Surface } from 'react-native-paper';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DeadlinePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  format?: 'short' | 'medium' | 'long';
  includeTime?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DeadlinePicker({ 
  value, 
  onChange, 
  label = 'Deadline',
  format = 'medium',
  includeTime = false,
  minDate = new Date(),
  maxDate,
}: DeadlinePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const theme = useTheme();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      if (includeTime && mode === 'date') {
        setTempDate(selectedDate);
        if (Platform.OS === 'ios') {
          setMode('time');
        } else {
          setTimeout(() => {
            setMode('time');
            setShowPicker(true);
          }, 500);
        }
      } else if (mode === 'time' && tempDate) {
        const finalDate = new Date(tempDate);
        finalDate.setHours(selectedDate.getHours());
        finalDate.setMinutes(selectedDate.getMinutes());
        onChange(finalDate);
        setShowPicker(false);
        setMode('date');
      } else {
        onChange(selectedDate);
        setShowPicker(false);
      }
    }
  };

  const validateDate = (date: Date): boolean => {
    const now = new Date();
    if (date < now) {
      return false;
    }
    if (minDate && date < minDate) {
      return false;
    }
    if (maxDate && date > maxDate) {
      return false;
    }
    return true;
  };

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const time = includeTime ? 
      ` at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` 
      : '';

    switch (format) {
      case 'short':
        return `${date.getDate()}/${date.getMonth() + 1}${time}`;
      case 'long':
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}${time}`;
      default: // medium
        return `${months[date.getMonth()]} ${date.getDate()}${time}`;
    }
  };

  const suggestions = [
    {
      label: 'Today',
      icon: 'calendar-today',
      date: new Date(new Date().setHours(23, 59, 59, 999)),
      color: theme.colors.primary,
    },
    {
      label: 'Tomorrow',
      icon: 'calendar-arrow-right',
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      color: theme.colors.secondary,
    },
    {
      label: 'Next Week',
      icon: 'calendar-week',
      date: new Date(new Date().setDate(new Date().getDate() + 7)),
      color: theme.colors.tertiary,
    },
    {
      label: 'End of Month',
      icon: 'calendar-month',
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      color: theme.colors.error,
    },
  ];

  return (
    <View>
      {label && (
        <Text style={{ marginBottom: 8, color: '#666' }}>{label}</Text>
      )}
      
      <View style={{ gap: 16 }}>
        <Button
          mode="outlined"
          onPress={() => setShowPicker(true)}
          icon="calendar"
          style={{
            borderRadius: 28,
            borderColor: '#e0e0e0',
          }}
          contentStyle={{ height: 48 }}
        >
          {value ? formatDate(value) : 'Set Deadline'}
        </Button>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.label}
              onPress={() => {
                onChange(suggestion.date);
                setShowSuggestions(false);
              }}
              style={{ flex: 1, minWidth: '48%' }}
            >
              <Surface
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: theme.colors.surfaceVariant,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  elevation: 1,
                }}
              >
                <MaterialCommunityIcons
                  name={suggestion.icon as any}
                  size={24}
                  color={suggestion.color}
                />
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500' }}>
                    {suggestion.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.outline }}>
                    {formatDate(suggestion.date)}
                  </Text>
                </View>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>

        {value && (
          <Button
            mode="text"
            onPress={() => onChange(null)}
            icon="close"
            textColor={theme.colors.error}
          >
            Clear Deadline
          </Button>
        )}
      </View>

      {/* Date Picker for iOS */}
      {Platform.OS === 'ios' && showPicker && (
        <Portal>
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              margin: 20,
              borderRadius: 16,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text style={{ marginBottom: 16, textAlign: 'center', fontWeight: '500' }}>
              {mode === 'date' ? 'Select Date' : 'Select Time'}
            </Text>
            <DateTimePicker
              value={tempDate || value || new Date()}
              mode={mode}
              display="spinner"
              onChange={handleDateChange}
              minimumDate={minDate}
              maximumDate={maxDate}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Button onPress={() => {
                setShowPicker(false);
                setMode('date');
              }}>
                Cancel
              </Button>
              <Button 
                mode="contained"
                onPress={() => {
                  if (tempDate) {
                    onChange(tempDate);
                  }
                  setShowPicker(false);
                  setMode('date');
                  setTempDate(null);
                }}
              >
                Done
              </Button>
            </View>
          </View>
        </Portal>
      )}

      {/* Date Picker for Android */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={tempDate || value || new Date()}
          mode={mode}
          onChange={handleDateChange}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}
    </View>
  );
} 