import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { COLORS } from '../../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoPlayer'>;

const VideoPlayerScreen: React.FC<Props> = ({ route }) => {
  const { contentId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Player</Text>
      <Text style={styles.contentId}>Content ID: {contentId}</Text>
      <Text style={styles.placeholder}>Video player will be implemented here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  contentId: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  placeholder: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default VideoPlayerScreen;