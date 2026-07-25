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
import PaymentWebViewScreen from '../screens/payment/PaymentWebViewScreen';
import PaymentSuccessScreen from '../screens/payment/PaymentSuccessScreen';
import PaymentErrorScreen from '../screens/payment/PaymentErrorScreen';
import MyListScreen from '../screens/mylist/MyListScreen';
import WatchHistoryScreen from '../screens/history/WatchHistoryScreen';
import RentalHistoryScreen from '../screens/rentals/RentalHistoryScreen';
import LiveEventsScreen from '../screens/live/LiveEventsScreen';
import LegalWebViewScreen from '../screens/legal/LegalWebViewScreen';
import AccountDeletionScreen from '../screens/legal/AccountDeletionScreen';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator<RootStackParamList>();
const smashLogo = require('../assets/smash-logo-transparent.png');
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
    }, 1800);
    return () => clearTimeout(splashTimer);
  }, [showSplash]);

  if (showSplash || isLoading || !hasHydrated) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashMark}>
          <Image source={smashLogo} style={styles.splashLogo} resizeMode="contain" />
        </View>
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
      initialRouteName={isAuthenticated ? 'Main' : 'Auth'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.warmCharcoal[100] },
      }}
    >
      <Stack.Screen
        name="LegalWeb"
        component={LegalWebViewScreen}
        options={({ route }: any) => ({ ...screenOptions, title: route.params?.title || 'SMASHSTREAM' })}
      />
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
            name="PaymentWebView"
            component={PaymentWebViewScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
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
            name="AccountDeletion"
            component={AccountDeletionScreen}
            options={{ ...screenOptions, title: 'Hapus Akun' }}
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
  splashMark: {
    alignItems: 'center',
  },
  splashLogo: {
    width: 210,
    height: 164,
  },
});

export default AppNavigator;
