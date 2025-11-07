import React, { useState } from 'react'
import { Alert, StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'
import { Ionicons } from '@expo/vector-icons'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  async function signInWithGoogle() {
    setOauthLoading('google')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'zapweb://auth/callback',
        },
      })
      if (error) Alert.alert(error.message)
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google')
    } finally {
      setOauthLoading(null)
    }
  }

  async function signInWithGithub() {
    setOauthLoading('github')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: 'zapweb://auth/callback',
        },
      })
      if (error) Alert.alert(error.message)
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with GitHub')
    } finally {
      setOauthLoading(null)
    }
  }

  async function signInWithApple() {
    setOauthLoading('apple')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'zapweb://auth/callback',
        },
      })
      if (error) Alert.alert(error.message)
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Apple')
    } finally {
      setOauthLoading(null)
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button 
          title="Sign in" 
          disabled={loading} 
          onPress={() => signInWithEmail()} 
          buttonStyle={styles.button}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading}
          onPress={() => signUpWithEmail()}
          buttonStyle={[styles.button, styles.signUpButton]}
        />
      </View>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>

      {/* One-Click Login Options */}
      <View style={styles.oauthContainer}>
        <TouchableOpacity
          style={[styles.oauthButton, styles.googleButton, oauthLoading === 'google' && styles.oauthButtonDisabled]}
          onPress={signInWithGoogle}
          disabled={oauthLoading !== null}
        >
          {oauthLoading === 'google' ? (
            <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
          ) : (
            <Ionicons name="logo-google" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.oauthButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.oauthButton, styles.githubButton, oauthLoading === 'github' && styles.oauthButtonDisabled]}
          onPress={signInWithGithub}
          disabled={oauthLoading !== null}
        >
          {oauthLoading === 'github' ? (
            <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
          ) : (
            <Ionicons name="logo-github" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.oauthButtonText}>Continue with GitHub</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.oauthButton, styles.appleButton, oauthLoading === 'apple' && styles.oauthButtonDisabled]}
          onPress={signInWithApple}
          disabled={oauthLoading !== null}
        >
          {oauthLoading === 'apple' ? (
            <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
          ) : (
            <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.oauthButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 12,
  },
  signUpButton: {
    backgroundColor: '#4F46E5',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  oauthContainer: {
    gap: 12,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  oauthButtonDisabled: {
    opacity: 0.6,
  },
  oauthButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  githubButton: {
    backgroundColor: '#24292E',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
})