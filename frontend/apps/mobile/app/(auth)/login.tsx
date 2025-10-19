import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuthActions } from '../../hooks/use-auth-actions';
import { useAuthStore } from '../../stores/auth';
import { useSettingsStore } from '../../stores/settings';
import { checkBiometricCapability, authenticateWithBiometrics, getBiometricTypeName } from '../../lib/biometric/biometric-auth';
import { tokenStorage } from '../../lib/storage/token-storage';
import { haptic } from '../../lib/haptics/haptic-feedback';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  
  const { login, isLoading } = useAuthActions();
  const { error, clearError } = useAuthStore();
  const { biometricEnabled } = useSettingsStore();

  // Check biometric capability and saved credentials on mount
  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const capability = await checkBiometricCapability();
    
    // Check for refresh token (persists after logout) instead of access token
    const savedRefreshToken = await tokenStorage.getRefreshToken();
    const savedUser = await tokenStorage.getUser();
    const hasSavedCredentials = !!(savedRefreshToken && savedUser);
    
    console.log('🔐 Login Screen - Biometric Check:');
    console.log('  Device capability:', capability.isAvailable);
    console.log('  Has saved credentials:', hasSavedCredentials);
    console.log('  Biometric enabled in settings:', biometricEnabled);
    console.log('  Refresh token found:', savedRefreshToken ? 'YES' : 'NO');
    console.log('  User data found:', savedUser ? 'YES' : 'NO');
    
    const showBiometric = capability.isAvailable && hasSavedCredentials && biometricEnabled;
    console.log('  Will show biometric button:', showBiometric);
    
    setBiometricAvailable(showBiometric);
    if (capability.isAvailable) {
      setBiometricType(getBiometricTypeName(capability.supportedTypes));
      console.log('  Biometric type:', getBiometricTypeName(capability.supportedTypes));
    }
  };

  const handleBiometricLogin = async () => {
    haptic.light();
    clearError();

    // Authenticate with biometrics first
    const result = await authenticateWithBiometrics('Login to Health Platform');
    
    if (result.success) {
      try {
        // Get saved credentials
        const savedUser = await tokenStorage.getUser();
        const savedRefreshToken = await tokenStorage.getRefreshToken();

        if (savedUser && savedRefreshToken) {
          console.log('✅ Biometric authenticated, refreshing access token...');
          
          // Use refresh token to get new access token
          const { authService } = await import('../../lib/api/services');
          const authData = await authService.refresh({ refreshToken: savedRefreshToken });
          
          // Save new tokens
          await tokenStorage.setAccessToken(authData.accessToken);
          await tokenStorage.setRefreshToken(authData.refreshToken);
          
          console.log('✅ New access token obtained');
          
          // Restore authentication
          useAuthStore.getState().setAuth(savedUser, authData.accessToken, authData.refreshToken);
          
          console.log('✅ Navigating to dashboard...');
          
          // Navigate to main app
          router.replace('/(tabs)');
        } else {
          Alert.alert('Error', 'No saved credentials found. Please login with password.');
        }
      } catch (error: any) {
        console.error('Biometric login error:', error);
        Alert.alert('Error', error.message || 'Failed to login with biometrics. Please use password.');
      }
    } else if (result.error) {
      Alert.alert('Authentication Failed', result.error);
    }
  };

  const handleLogin = () => {
    // Haptic feedback
    haptic.medium();
    
    // Clear any previous errors
    clearError();
    
    // Basic validation
    if (!email || !password) {
      haptic.error();
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Call real API login
    login({ email, password });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back! 👋</Text>
        <Text style={styles.subtitle}>Sign in to continue your health journey</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Biometric Login Option */}
        {biometricAvailable && (
          <TouchableOpacity 
            style={styles.biometricButton} 
            onPress={handleBiometricLogin}
            disabled={isLoading}
          >
            <Text style={styles.biometricText}>Or use {biometricType}</Text>
          </TouchableOpacity>
        )}

        <Link href="/(auth)/register" style={styles.linkContainer}>
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
          </Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#6b7280',
  },
  linkBold: {
    color: '#667eea',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  biometricButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  biometricText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
});

