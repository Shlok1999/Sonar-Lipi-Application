import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, View, Platform, StatusBar } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#6A45D1',
        tabBarInactiveTintColor: '#6D6D8A',
        headerStyle: {
          backgroundColor: '#F5F7FF',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: '#1E1E2E',
          fontSize: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: true,
          title: '',
          headerTitle: 'Compositions',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : styles.iconContainer}>
              <Feather name="music" size={size} color={focused ? '#FFFFFF' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : styles.iconContainer}>
              <Feather name="settings" size={size} color={focused ? '#FFFFFF' : color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  activeIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    backgroundColor: '#6A45D1',
    borderRadius: 20,
    shadowColor: '#6A45D1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});