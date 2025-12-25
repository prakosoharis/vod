import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import VideoPlayerScreen from '../screens/player/VideoPlayerScreen';
import LiveStreamScreen from '../screens/live/LiveStreamScreen';
import ContentDetailScreen from '../screens/content/ContentDetailScreen';
import { RootStackParamList } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated, isLoading, hasHydrated, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) {
      checkAuth();
    }
  }, [checkAuth, hasHydrated]);

  if (isLoading || !hasHydrated) {
    return <LoadingSpinner />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="VideoPlayer"
            component={VideoPlayerScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="LiveStream"
            component={LiveStreamScreen}
            options={{
              headerShown: true,
              title: 'Live Streaming',
              headerStyle: {
                backgroundColor: '#000000',
                borderBottomWidth: 0,
              },
              headerTintColor: '#FFFFFF',
            }}
          />
          <Stack.Screen
            name="ContentDetail"
            component={ContentDetailScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;