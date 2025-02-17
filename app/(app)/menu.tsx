import { ScrollView } from 'react-native';
import { List, Divider, useTheme } from 'react-native-paper';
import { useAuth } from '@/contexts/auth';
import { ScreenLayout } from '@/components/ScreenLayout';

export default function MenuScreen() {
  const theme = useTheme();
  const { signOut } = useAuth();

  return (
    <ScreenLayout
      title="Menu"
      subtitle="Settings and more"
    >
      <ScrollView style={{ flex: 1 }}>
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Settings"
            left={props => <List.Icon {...props} icon="cog" />}
            onPress={() => {}}
          />
          <List.Item
            title="Profile"
            left={props => <List.Icon {...props} icon="account" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Sign Out"
            left={props => <List.Icon {...props} icon="logout" />}
            onPress={signOut}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>App</List.Subheader>
          <List.Item
            title="Theme"
            left={props => <List.Icon {...props} icon="palette" />}
            onPress={() => {}}
          />
          <List.Item
            title="Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            onPress={() => {}}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Support</List.Subheader>
          <List.Item
            title="Help & Feedback"
            left={props => <List.Icon {...props} icon="help-circle" />}
            onPress={() => {}}
          />
          <List.Item
            title="About"
            left={props => <List.Icon {...props} icon="information" />}
            onPress={() => {}}
          />
        </List.Section>
      </ScrollView>
    </ScreenLayout>
  );
} 