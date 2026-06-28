import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import SearchScreen from '../screens/search/SearchScreen';
import VideoPlayerScreen from '../screens/player/VideoPlayerScreen';
import LiveStreamScreen from '../screens/live/LiveStreamScreen';
import ContentDetailScreen from '../screens/content/ContentDetailScreen';
import PricingScreen from '../screens/payment/PricingScreen';
import PaymentSuccessScreen from '../screens/payment/PaymentSuccessScreen';
import PaymentErrorScreen from '../screens/payment/PaymentErrorScreen';
import MyListScreen from '../screens/mylist/MyListScreen';
import WatchHistoryScreen from '../screens/history/WatchHistoryScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';
import RentalHistoryScreen from '../screens/rentals/RentalHistoryScreen';
import LiveEventsScreen from '../screens/live/LiveEventsScreen';
import UpcomingScreen from '../screens/upcoming/UpcomingScreen';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator<RootStackParamList>();
const mostaraLogo = require('../assets/logo.png');
let hasShownInitialSplash = false;

const AppNavigator = () => {
  const { isAuthenticated, isLoading, hasHydrated, checkAuth } = useAuthStore();
  const [showSplash, setShowSplash] = useState(!hasShownInitialSplash);

  useEffect(() => {
    if (!hasHydrated) {
      checkAuth();
    }
  }, [checkAuth, hasHydrated]);

  useEffect(() => {
    if (!showSplash) {
      return;
    }

    const splashTimer = setTimeout(() => {
      hasShownInitialSplash = true;
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(splashTimer);
  }, [showSplash]);

  if (showSplash || isLoading || !hasHydrated) {
    return (
      <View style={styles.splashContainer}>
        <Image source={mostaraLogo} style={styles.splashLogo} resizeMode="contain" />
      </View>
    );
  }

  const screenOptions: NativeStackNavigationOptions = {
    headerShown: true,
    headerStyle: {
      backgroundColor: COLORS.warmCharcoal[100],
    },
    headerTintColor: COLORS.cream[50],
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: '600' as const,
    },
    headerBackTitle: 'Kembali',
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.warmCharcoal[100] },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="VideoPlayer"
            component={VideoPlayerScreen}
            options={{
              headerShown: false,
              orientation: 'landscape',
            }}
          />
          <Stack.Screen
            name="LiveStream"
            component={LiveStreamScreen}
            options={{
              headerShown: false,
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
          <Stack.Screen
            name="Pricing"
            component={PricingScreen}
            options={screenOptions}
          />
          <Stack.Screen
            name="PaymentSuccess"
            component={PaymentSuccessScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PaymentError"
            component={PaymentErrorScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MyList"
            component={MyListScreen}
            options={screenOptions}
          />
          <Stack.Screen
            name="WatchHistory"
            component={WatchHistoryScreen}
            options={screenOptions}
          />
          <Stack.Screen
            name="Subscription"
            component={SubscriptionScreen}
            options={screenOptions}
          />
          <Stack.Screen
            name="RentalHistory"
            component={RentalHistoryScreen}
            options={screenOptions}
          />
          <Stack.Screen
            name="LiveEvents"
            component={LiveEventsScreen}
            options={screenOptions}
          />
          <Stack.Screen
            name="Upcoming"
            component={UpcomingScreen}
            options={screenOptions}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warmCharcoal[100],
  },
  splashLogo: {
    width: 150,
    height: 150,
  },
});

export default AppNavigator;
