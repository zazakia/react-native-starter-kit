import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

// Use Expo Constants to access environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY

// Debug logging to validate environment variables
console.log('DEBUG: supabaseUrl:', supabaseUrl)
console.log('DEBUG: supabaseAnonKey:', supabaseAnonKey)
console.log('DEBUG: Constants.expoConfig:', Constants.expoConfig)

// Platform-specific storage configuration
const getStorage = () => {
  if (Platform.OS === 'web') {
    // For web, use localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      return {
        getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
        setItem: (key: string, value: string) => {
          localStorage.setItem(key, value)
          return Promise.resolve()
        },
        removeItem: (key: string) => {
          localStorage.removeItem(key)
          return Promise.resolve()
        },
      }
    }
    // Fallback for SSR or other environments
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    }
  }
  // For native platforms, use AsyncStorage
  return AsyncStorage
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web' ? true : false,
  },
})

// Auto-refresh token setup (only for native platforms)
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}