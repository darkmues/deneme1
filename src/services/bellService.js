import { Audio } from 'expo-av';

let soundObject = null;

export const bellService = {
  async init() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    } catch {}
  },

  async ring(times = 1) {
    try {
      if (soundObject) {
        await soundObject.unloadAsync();
        soundObject = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/bell.wav'),
        { shouldPlay: false, volume: 1.0 }
      );
      soundObject = sound;

      for (let i = 0; i < times; i++) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
        await new Promise(r => setTimeout(r, 2200));
      }
    } catch (e) {
      console.warn('Bell sound error:', e);
    }
  },

  async stop() {
    try {
      if (soundObject) {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
        soundObject = null;
      }
    } catch {}
  },
};
