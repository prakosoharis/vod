/**
 * Web Storage Adapter
 * Drop-in replacement for @react-native-async-storage/async-storage
 * Uses localStorage (works in webOS TV browser context)
 */

export const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn('AsyncStorage.getItem failed:', key, e);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn('AsyncStorage.setItem failed:', key, e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn('AsyncStorage.removeItem failed:', key, e);
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    try {
      keys.forEach((k) => window.localStorage.removeItem(k));
    } catch (e) {
      console.warn('AsyncStorage.multiRemove failed:', keys, e);
    }
  },

  async clear(): Promise<void> {
    try {
      window.localStorage.clear();
    } catch (e) {
      console.warn('AsyncStorage.clear failed:', e);
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(window.localStorage);
    } catch (e) {
      return [];
    }
  },
};

export default AsyncStorage;
