import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Eye,
  XCircle,
  Plus,
} from 'lucide-react-native';
import { useMyConsultations, useCancelConsultation } from '../../hooks/use-consultations';
import type { Consultation, ConsultationType } from '@health-platform/types';

const TYPE_ICONS: Record<ConsultationType, any> = {
  VIDEO: Video,
  PHONE: Phone,
  IN_PERSON: MapPin,
};

export default function MyConsultationsScreen() {
  const router = useRouter();
  const { data: consultations, isLoading, error } = useMyConsultations();
  const cancelConsultation = useCancelConsultation();

  // Separate upcoming and past
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

  const handleCancel = (consultation: Consultation) => {
    Alert.alert(
      'Cancel Consultation',
      `Are you sure you want to cancel your consultation with ${consultation.doctor?.name}?`,
      [
        { text: 'Keep Consultation', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelConsultation.mutateAsync(consultation.id);
              Alert.alert('Success', 'Consultation cancelled successfully');
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to cancel consultation'
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading consultations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load consultations</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Consultations</Text>
          <Text style={styles.subtitle}>Manage your appointments</Text>
        </View>
      </View>

      {/* Book Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity
          style={styles.bookNewButton}
          onPress={() => router.push('/consultations/browse')}
          activeOpacity={0.8}
        >
          <Plus color="#fff" size={20} />
          <Text style={styles.bookNewButtonText}>Book New Consultation</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {consultations && consultations.length > 0 ? (
          <>
            {/* Upcoming */}
            {upcoming && upcoming.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming ({upcoming.length})</Text>
                {upcoming.map((consultation) => (
                  <ConsultationCard
                    key={consultation.id}
                    consultation={consultation}
                    onView={() => router.push(`/consultation-detail/${consultation.id}`)}
                    onCancel={() => handleCancel(consultation)}
                  />
                ))}
              </View>
            )}

            {/* Past */}
            {past && past.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Past ({past.length})</Text>
                {past.map((consultation) => (
                  <ConsultationCard
                    key={consultation.id}
                    consultation={consultation}
                    onView={() => router.push(`/consultation-detail/${consultation.id}`)}
                    isPast
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Calendar color="#9ca3af" size={64} />
            <Text style={styles.emptyText}>No consultations yet</Text>
            <Text style={styles.emptySubtext}>
              Book your first consultation with our expert doctors
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/consultations/browse')}
            >
              <Text style={styles.emptyButtonText}>Browse Doctors</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ConsultationCard({
  consultation,
  onView,
  onCancel,
  isPast = false,
}: {
  consultation: Consultation;
  onView: () => void;
  onCancel?: () => void;
  isPast?: boolean;
}) {
  const TypeIcon = TYPE_ICONS[consultation.type];

  return (
    <View style={styles.consultationCard}>
      <View style={styles.cardHeader}>
        {consultation.doctor?.imageUrl ? (
          <Image
            source={{ uri: consultation.doctor.imageUrl }}
            style={styles.doctorImage}
          />
        ) : (
          <View style={styles.doctorImagePlaceholder}>
            <Text style={styles.doctorImageText}>
              {consultation.doctor?.name.charAt(0)}
            </Text>
          </View>
        )}
        <View style={styles.cardHeaderContent}>
          <Text style={styles.doctorName}>{consultation.doctor?.name}</Text>
          <Text style={styles.doctorSpec}>{consultation.doctor?.specialization}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{consultation.status}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Calendar color="#6b7280" size={16} />
          <Text style={styles.detailText}>
            {new Date(consultation.scheduledAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Clock color="#6b7280" size={16} />
          <Text style={styles.detailText}>
            {new Date(consultation.scheduledAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            ({consultation.duration} min)
          </Text>
        </View>

        <View style={styles.detailRow}>
          <TypeIcon color="#6b7280" size={16} />
          <Text style={styles.detailText}>{consultation.type}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.fee}>
          <Text style={styles.feeLabel}>Fee:</Text>
          <Text style={styles.feeAmount}>₹{consultation.fee}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.viewButton} onPress={onView} activeOpacity={0.7}>
            <Eye color="#667eea" size={16} />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
          {!isPast && onCancel && (
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
              <XCircle color="#ef4444" size={16} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  bookButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  bookNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  bookNewButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  consultationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  doctorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  doctorImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorImageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardHeaderContent: {
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
  },
  statusBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  cardDetails: {
    marginBottom: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  fee: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  feeLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667eea',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  emptyButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

