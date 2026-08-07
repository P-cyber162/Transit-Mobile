// ============================================================
// store/ui.store.ts — UI & Preferences Zustand Store
// ============================================================

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_STORAGE_KEYS } from '../constants';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface UIPreferences {
  isDarkMode: boolean;
  pushNotificationsEnabled: boolean;
  language: string;
  rememberMeEmail: string;
}

interface UIState extends UIPreferences {
  isOnline: boolean;
  toast: ToastState | null;

  setOnlineStatus: (status: boolean) => void;
  showToast: (message: string, type?: ToastState['type']) => void;
  hideToast: () => void;
  toggleDarkMode: () => void;
  togglePushNotifications: () => void;
  setPushNotificationsEnabled: (enabled: boolean) => void;
  setLanguage: (lang: string) => void;
  setRememberMeEmail: (email: string) => void;
  loadPreferences: () => Promise<void>;
  savePreferences: () => Promise<void>;
}

export const useUIStore = create<UIState>((set, get) => ({
  isDarkMode: true,
  pushNotificationsEnabled: true,
  language: 'en',
  rememberMeEmail: '',
  isOnline: true,
  toast: null,

  setOnlineStatus: (status) => set({ isOnline: status }),

  showToast: (message, type = 'success') => {
    const id = String(Date.now());
    set({ toast: { id, message, type } });
    setTimeout(() => {
      if (get().toast?.id === id) {
        set({ toast: null });
      }
    }, 3500);
  },

  hideToast: () => set({ toast: null }),

  toggleDarkMode: () => {
    const next = !get().isDarkMode;
    set({ isDarkMode: next });
    get().savePreferences();
  },

  togglePushNotifications: () => {
    const next = !get().pushNotificationsEnabled;
    set({ pushNotificationsEnabled: next });
    get().savePreferences();
  },

  setPushNotificationsEnabled: (enabled) => {
    set({ pushNotificationsEnabled: enabled });
    get().savePreferences();
  },

  setLanguage: (lang) => {
    set({ language: lang });
    get().savePreferences();
  },

  setRememberMeEmail: (email) => {
    set({ rememberMeEmail: email });
    AsyncStorage.setItem(ASYNC_STORAGE_KEYS.REMEMBERED_EMAIL, email).catch(() => {});
  },

  savePreferences: async () => {
    try {
      const state = get();
      const prefs: UIPreferences = {
        isDarkMode: state.isDarkMode,
        pushNotificationsEnabled: state.pushNotificationsEnabled,
        language: state.language,
        rememberMeEmail: state.rememberMeEmail,
      };
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.UI_PREFERENCES, JSON.stringify(prefs));
    } catch {}
  },

  loadPreferences: async () => {
    try {
      const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.UI_PREFERENCES);
      const email = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.REMEMBERED_EMAIL);

      let prefs: Partial<UIPreferences> = {};
      if (raw) prefs = JSON.parse(raw);

      set({
        isDarkMode: prefs.isDarkMode ?? true,
        pushNotificationsEnabled: prefs.pushNotificationsEnabled ?? true,
        language: prefs.language ?? 'en',
        rememberMeEmail: email || prefs.rememberMeEmail || '',
      });
    } catch {}
  },
}));
