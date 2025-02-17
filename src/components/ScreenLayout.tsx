import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaWrapper } from './SafeAreaWrapper';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { SearchBar } from './SearchBar';

interface ScreenLayoutProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
  fab?: React.ReactNode;
}

export function ScreenLayout({ 
  title, 
  subtitle,
  showSearch = false,
  action,
  children,
  fab
}: ScreenLayoutProps) {
  const theme = useTheme();

  return (
    <SafeAreaWrapper>
      <Header 
        title={title}
        subtitle={subtitle}
        action={action}
      />

      {showSearch && <SearchBar />}

      <View style={{ flex: 1 }}>
        {children}
      </View>

      {fab}
      
      <BottomNavigation />
    </SafeAreaWrapper>
  );
} 