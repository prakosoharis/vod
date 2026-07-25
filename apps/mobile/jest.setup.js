jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-config', () => ({
  API_BASE_URL: 'http://127.0.0.1:3001/api',
  SOCKET_URL: 'http://127.0.0.1:3002',
}));

jest.mock('react-native-linear-gradient', () => require('react-native').View);
jest.mock('react-native-vector-icons/MaterialIcons', () => require('react-native').Text);
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => require('react-native').Text);
jest.mock('react-native-video', () => require('react-native').View);
jest.mock('react-native-webview', () => ({ WebView: require('react-native').View }));
jest.mock('react-native-orientation-locker', () => ({
  lockToLandscape: jest.fn(),
  lockToPortrait: jest.fn(),
  unlockAllOrientations: jest.fn(),
}));
jest.mock('@react-native-community/slider', () => require('react-native').View);
