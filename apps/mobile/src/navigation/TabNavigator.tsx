import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeIcon } from '../components/ui';
import { COLORS, THEME } from '../constants';
import HomeScreen from '../screens/home/HomeScreen';
import BrowseScreen from '../screens/browse/BrowseScreen';
import LiveScreen from '../screens/live/LiveScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Browse':
              iconName = 'search';
              break;
            case 'Live':
              iconName = 'live-tv';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return (
            <SafeIcon
              name={iconName}
              size={focused ? 28 : 24}
              color={color}
              style={{ marginBottom: -2 }}
            />
          );
        },
        tabBarActiveTintColor: COLORS.accent[500],
        tabBarInactiveTintColor: COLORS.cream[200],
        tabBarStyle: {
          backgroundColor: COLORS.warmCharcoal[100],
          borderTopColor: `${COLORS.warmCharcoal[50]}80`,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 6,
          paddingTop: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: THEME.typography.fontSize.xs,
          fontWeight: THEME.typography.fontWeight.semibold,
          marginTop: 2,
          marginBottom: 2,
          letterSpacing: 0.5,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: COLORS.warmCharcoal[100],
          borderBottomColor: COLORS.warmCharcoal[50],
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: COLORS.cream[50],
        headerTitleStyle: {
          fontSize: THEME.typography.fontSize.xl,
          fontWeight: THEME.typography.fontWeight.bold,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Beranda',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Browse"
        component={BrowseScreen}
        options={{
          title: 'Jelajahi',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Live"
        component={LiveScreen}
        options={{
          title: 'Live',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;