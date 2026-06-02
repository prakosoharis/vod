/**
 * Mostara Mobile App
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import QueryProvider from './src/providers/QueryProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />
      <NavigationContainer>
        <QueryProvider>
          <AppNavigator />
        </QueryProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
