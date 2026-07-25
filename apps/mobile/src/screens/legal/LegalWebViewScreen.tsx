import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../../constants';

const allowedPaths = new Set(['/privacy', '/terms', '/contact', '/refund-policy', '/account-deletion']);

const LegalWebViewScreen = ({ route }: any) => {
  const requestedPath = route.params?.path || '/privacy';
  const path = allowedPaths.has(requestedPath) ? requestedPath : '/privacy';
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: `https://smashstream.id${path}` }}
        originWhitelist={['https://smashstream.id']}
        sharedCookiesEnabled={false}
        thirdPartyCookiesEnabled={false}
        javaScriptCanOpenWindowsAutomatically={false}
        setSupportMultipleWindows={false}
        startInLoadingState
        renderLoading={() => <ActivityIndicator style={styles.loader} color={COLORS.accent[500]} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.warmCharcoal[100] },
  loader: { position: 'absolute', alignSelf: 'center', top: '45%' },
});

export default LegalWebViewScreen;
