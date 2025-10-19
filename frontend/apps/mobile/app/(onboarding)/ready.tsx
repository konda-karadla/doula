import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../stores/settings';

export default function ReadyScreen() {
  const router = useRouter();
  const { setOnboardingComplete } = useSettingsStore();

  const handleGetStarted = () => {
    // Mark onboarding as complete
    setOnboardingComplete(true);
    
    // Navigate to login
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.description}>
          Ready to start your health journey? Create an account or sign in to get started.
        </Text>

        <View style={styles.benefits}>
          <Text style={styles.benefitItem}>✓ Secure data storage</Text>
          <Text style={styles.benefitItem}>✓ AI-powered insights</Text>
          <Text style={styles.benefitItem}>✓ Track your progress</Text>
          <Text style={styles.benefitItem}>✓ Personalized action plans</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Let's Go! →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  benefits: {
    width: '100%',
    paddingHorizontal: 40,
    gap: 12,
  },
  benefitItem: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

