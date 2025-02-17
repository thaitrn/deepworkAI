import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#db4c3f', // Todoist red
    secondary: '#555555',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    error: '#ff4d4f',
    success: '#52c41a',
    warning: '#faad14',
    outline: '#666666',
    outlineVariant: '#e0e0e0',
  },
}; 