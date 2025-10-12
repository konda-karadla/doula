import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Stethoscope, ArrowRight, Clock, TrendingUp } from 'lucide-react-native';
import { useMyConsultations } from '../../hooks/use-consultations';

export default function ConsultationsHubScreen() {
  const router = useRouter();
  const { data: consultations, isLoading } = useMyConsultations();

  // Calculate stats
  const now = new Date();
  const upcoming = consultations?.filter(
    (c) =>
      new Date(c.scheduledAt) >= now &&
      c.status !== 'COMPLETED' &&
      c.status !== 'CANCELLED'
  );
  const past = consultations?.filter(
    (c) =>
      new Date(c.scheduledAt) < now ||
      c.status === 'COMPLETED' ||
      c.status === 'CANCELLED'
  );
  const total = consultations?.length || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Consultations</Text>
        <Text style={styles.subtitle}>
          Connect with expert healthcare professionals
        </Text>
      </View>

      {/* Stats */}
      {!isLoading && total > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>{upcoming?.length || 0}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#6b7280' }]}>{past?.length || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      )}

      {/* Main Action Cards */}
      <View style={styles.actionCards}>
        {/* Book Consultation Card */}
        <TouchableOpacity
          style={[styles.actionCard, styles.primaryCard]}
          onPress={() => router.push('/consultations/browse')}
          activeOpacity={0.7}
        >
          <View style={styles.actionCardHeader}>
            <View style={styles.iconContainer}>
              <Stethoscope color="#667eea" size={28} />
            </View>
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>Book Consultation</Text>
              <Text style={styles.actionCardDescription}>
                Schedule with our healthcare experts
              </Text>
            </View>
          </View>
          <View style={styles.actionCardFeatures}>
            <Text style={styles.featureText}>✓ Real-time availability</Text>
            <Text style={styles.featureText}>✓ 30-minute consultations</Text>
            <Text style={styles.featureText}>✓ Video, phone, or in-person</Text>
          </View>
          <View style={styles.actionCardButton}>
            <Text style={styles.buttonText}>Browse Doctors</Text>
            <ArrowRight color="#667eea" size={20} />
          </View>
        </TouchableOpacity>

        {/* My Consultations Card */}
        <TouchableOpacity
          style={[styles.actionCard, styles.secondaryCard]}
          onPress={() => router.push('/consultations/my-bookings')}
          activeOpacity={0.7}
        >
          <View style={styles.actionCardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
              <Calendar color="#9333ea" size={28} />
            </View>
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>My Consultations</Text>
              <Text style={styles.actionCardDescription}>
                View and manage your appointments
              </Text>
            </View>
          </View>
          
          {!isLoading && (
            <View style={styles.badges}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{upcoming?.length || 0} Upcoming</Text>
              </View>
              <View style={[styles.badge, styles.badgeSecondary]}>
                <Text style={[styles.badgeText, { color: '#6b7280' }]}>{past?.length || 0} Past</Text>
              </View>
            </View>
          )}
          
          <View style={[styles.actionCardButton, { backgroundColor: '#f3e8ff' }]}>
            <Text style={[styles.buttonText, { color: '#9333ea' }]}>View Consultations</Text>
            <ArrowRight color="#9333ea" size={20} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Next Consultation Preview */}
      {!isLoading && upcoming && upcoming.length > 0 && (
        <View style={styles.nextConsultation}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Next Consultation</Text>
            <TouchableOpacity onPress={() => router.push('/consultations/my-bookings')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.consultationPreview}
            onPress={() => router.push(`/consultation-detail/${upcoming[0].id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.doctorInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {upcoming[0].doctor?.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.doctorDetails}>
                <Text style={styles.doctorName}>{upcoming[0].doctor?.name}</Text>
                <Text style={styles.doctorSpec}>{upcoming[0].doctor?.specialization}</Text>
                <View style={styles.consultationMeta}>
                  <Calendar color="#667eea" size={14} />
                  <Text style={styles.metaText}>
                    {new Date(upcoming[0].scheduledAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Clock color="#667eea" size={14} style={{ marginLeft: 12 }} />
                  <Text style={styles.metaText}>
                    {new Date(upcoming[0].scheduledAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{upcoming[0].status}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* How It Works */}
      <View style={styles.howItWorks}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.steps}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Browse</Text>
            <Text style={styles.stepDescription}>Explore our doctors</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Select</Text>
            <Text style={styles.stepDescription}>Pick date & time</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Confirm</Text>
            <Text style={styles.stepDescription}>Book instantly</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepTitle}>Attend</Text>
            <Text style={styles.stepDescription}>Join consultation</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actionCards: {
    gap: 16,
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryCard: {
    borderWidth: 2,
    borderColor: '#e0e7ff',
  },
  secondaryCard: {
    borderWidth: 2,
    borderColor: '#f3e8ff',
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  actionCardDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionCardFeatures: {
    marginBottom: 16,
  },
  featureText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeSecondary: {
    backgroundColor: '#e5e7eb',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  actionCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e0e7ff',
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  nextConsultation: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  consultationPreview: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  doctorSpec: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  consultationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  statusBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  howItWorks: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
});

