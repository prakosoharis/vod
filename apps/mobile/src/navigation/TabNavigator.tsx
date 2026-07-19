import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeIcon } from '../components/ui';
import { COLORS, THEME } from '../constants';
import HomeScreen from '../screens/home/HomeScreen';
import BrowseScreen from '../screens/browse/BrowseScreen';
import LiveScreen from '../screens/live/LiveScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MyListScreen from '../screens/mylist/MyListScreen';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
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
              iconName = 'grid-view';
              break;
            case 'Live':
              iconName = 'live-tv';
              break;
            case 'Collection':
              iconName = 'bookmark-border';
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
              size={focused ? 25 : 23}
              color={color}
              style={{ marginBottom: -2 }}
            />
          );
        },
        tabBarActiveTintColor: COLORS.accent[500],
        tabBarInactiveTintColor: COLORS.cream[200],
        tabBarStyle: {
          backgroundColor: COLORS.warmCharcoal[200],
          borderTopColor: `${COLORS.cream[50]}14`,
          borderTopWidth: 1,
          height: 72 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
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
          borderBottomColor: `${COLORS.cream[50]}12`,
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
        name="Collection"
        component={MyListScreen}
        options={{
          title: 'Koleksi',
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
