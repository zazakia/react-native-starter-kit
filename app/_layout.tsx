import { useState, useEffect } from 'react'
import { supabase } from '../src/lib/supabase'
import { Stack } from 'expo-router'
import { Session } from '@supabase/supabase-js'
import Auth from '../src/components/Auth'
import { View } from 'react-native'

export default function Layout() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (!session) {
    return (
      <View style={{ flex: 1 }}>
        <Auth />
      </View>
    )
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F8FAFC',
        },
        headerShadowVisible: false,
        headerTintColor: '#1E293B',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Note',
          presentation: 'modal',
        }}
      />
    </Stack>
  )
}
