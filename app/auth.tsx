import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, UserPlus, LogIn } from 'lucide-react-native';
import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const signupMutation = trpc.auth.signup.useMutation();
  const loginMutation = trpc.auth.login.useMutation();

  const isLoading = signupMutation.isPending || loginMutation.isPending;

  const validateEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith('@usf.edu');
  };

  const handleSignup = async () => {
    setErrorMessage('');
    
    console.log('[Auth] Signup attempt started', { email, hasPassword: !!password, hasConfirmPassword: !!confirmPassword });
    
    if (!email || !password || !confirmPassword) {
      console.log('[Auth] Validation failed: missing fields');
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      console.log('[Auth] Validation failed: invalid email domain', email);
      setErrorMessage('Only University of South Florida (@usf.edu) email addresses are accepted.');
      return;
    }

    if (password.length < 6) {
      console.log('[Auth] Validation failed: password too short');
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      console.log('[Auth] Validation failed: passwords do not match');
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('[Auth] Attempting signup mutation', { email: email.toLowerCase(), userId });
      
      const result = await signupMutation.mutateAsync({
        email: email.toLowerCase(),
        password,
        userId,
      });

      console.log('[Auth] Signup successful:', result);
      
      await AsyncStorage.setItem('userAuth', JSON.stringify({
        userId: result.userId,
        email: result.email,
        isAuthenticated: true,
      }));

      console.log('[Auth] Redirecting to onboarding');
      router.replace('/onboarding');
    } catch (error: unknown) {
      console.error('[Auth] Signup error:', error);
      console.error('[Auth] Error type:', typeof error);
      console.error('[Auth] Error details:', JSON.stringify(error, null, 2));
      
      let message = 'Signup failed. Please try again.';
      
      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          message = error.message;
        } else if ('data' in error && error.data && typeof error.data === 'object') {
          const data = error.data as { message?: string };
          if (data.message) {
            message = data.message;
          }
        }
      }
      
      setErrorMessage(message);
      console.error('[Auth] Final error message:', message);
    }
  };

  const handleLogin = async () => {
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        email: email.toLowerCase(),
        password,
      });

      console.log('Login successful:', result);
      
      await AsyncStorage.setItem('userAuth', JSON.stringify({
        userId: result.userId,
        email: result.email,
        isAuthenticated: true,
      }));

      if (result.user && result.user.onboardingCompleted) {
        router.replace('/waiting-room');
      } else {
        router.replace('/onboarding');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      setErrorMessage(message);
      console.error('Login error:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.dark.background, Colors.dark.accent, Colors.dark.primaryDark]}
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.grassIcon}>🌿</Text>
              <Text style={styles.title}>Touch Grass</Text>
              <Text style={styles.betaText}>BETA</Text>
              <Text style={styles.subtitle}>
                {mode === 'signup' 
                  ? 'Join the USF community'
                  : 'Welcome back!'}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeButton, mode === 'signup' && styles.modeButtonActive]}
                  onPress={() => setMode('signup')}
                >
                  <UserPlus 
                    size={20} 
                    color={mode === 'signup' ? Colors.dark.primaryLight : Colors.dark.textSecondary} 
                  />
                  <Text style={[styles.modeButtonText, mode === 'signup' && styles.modeButtonTextActive]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
                  onPress={() => setMode('login')}
                >
                  <LogIn 
                    size={20} 
                    color={mode === 'login' ? Colors.dark.primaryLight : Colors.dark.textSecondary} 
                  />
                  <Text style={[styles.modeButtonText, mode === 'login' && styles.modeButtonTextActive]}>
                    Log In
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color={Colors.dark.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="USF Email (@usf.edu)"
                    placeholderTextColor={Colors.dark.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Lock size={20} color={Colors.dark.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={Colors.dark.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                  />
                </View>

                {mode === 'signup' && (
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color={Colors.dark.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor={Colors.dark.textTertiary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="password"
                    />
                  </View>
                )}
              </View>

              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
                </View>
              ) : null}

              {mode === 'signup' && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    🎓 USF Students Only
                  </Text>
                  <Text style={styles.infoSubtext}>
                    Only @usf.edu emails are accepted to ensure a trusted community of University of South Florida students.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={mode === 'signup' ? handleSignup : handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#059669', '#10B981', '#2ECC71', '#00FF88']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.dark.background} />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {mode === 'signup' ? 'Create Account' : 'Log In'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '900' as const,
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  grassIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  betaText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.dark.primaryLight,
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 16,
    letterSpacing: 6,
    textShadowColor: Colors.dark.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.dark.glass,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modeButtonActive: {
    backgroundColor: Colors.dark.glass,
    borderWidth: 1,
    borderColor: Colors.dark.primaryLight,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.dark.textSecondary,
  },
  modeButtonTextActive: {
    color: Colors.dark.primaryLight,
    fontWeight: '700' as const,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
  },
  infoBox: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.primaryDark,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.dark.text,
    marginBottom: 6,
  },
  infoSubtext: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.dark.background,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FCA5A5',
    lineHeight: 20,
  },
});
