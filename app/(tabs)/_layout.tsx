import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#9B2335',
        tabBarInactiveTintColor: '#5E3023',
        headerStyle: {
          backgroundColor: '#FFF8E7',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: '#5E3023',
        },
        tabBarStyle: {
          backgroundColor: '#FFF8E7',
          borderTopColor: '#D4AF3733',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Compositions',
          tabBarIcon: ({ color, size }) => (
            <Feather name="music" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});