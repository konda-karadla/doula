import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../stores/auth';
import { useAuthActions } from '../../hooks/use-auth-actions';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { logout } = useAuthActions();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile 👤</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || 'Not available'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user?.username || 'Not available'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.valueSmall}>{user?.id || 'Not available'}</Text>
        </View>

        {user?.role && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{user.role}</Text>
          </View>
        )}
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Coming Soon Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coming Soon</Text>
        <Text style={styles.description}>
          • Edit profile information{'\n'}
          • Manage notification settings{'\n'}
          • Change password{'\n'}
          • Biometric authentication{'\n'}
          • App preferences
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  valueSmall: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

