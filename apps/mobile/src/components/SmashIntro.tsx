import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Video from 'react-native-video';

type SmashIntroProps = {
  onFinished: () => void;
};

const INTRO_TIMEOUT_MS = 13000;

export default function SmashIntro({onFinished}: SmashIntroProps) {
  useEffect(() => {
    // Never trap the user on the intro if a device cannot decode the asset.
    const timeout = setTimeout(onFinished, INTRO_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [onFinished]);

  return (
    <View style={styles.overlay}>
      <Video
        source={require('../assets/videos/smash-intro.mp4')}
        style={styles.video}
        resizeMode="contain"
        paused={false}
        repeat={false}
        controls={false}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
        onEnd={onFinished}
        onError={onFinished}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
});
