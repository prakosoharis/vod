/**
 * SMASH Mobile App
 * @format
 */

import React, {useCallback, useState} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import QueryProvider from './src/providers/QueryProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants';
import SmashIntro from './src/components/SmashIntro';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const finishIntro = useCallback(() => setShowIntro(false), []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={
          showIntro ? '#000000' : COLORS.warmCharcoal[100]
        }
        translucent={false}
      />
      <View style={styles.container}>
        <NavigationContainer>
          <QueryProvider>
            <AppNavigator />
          </QueryProvider>
        </NavigationContainer>
        {showIntro && <SmashIntro onFinished={finishIntro} />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
