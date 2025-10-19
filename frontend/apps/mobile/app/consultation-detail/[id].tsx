import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  DollarSign,
  Stethoscope,
  User,
  FileText,
  ExternalLink,
} from 'lucide-react-native';
import { useConsultation } from '../../hooks/use-consultations';
import type { ConsultationType } from '@health-platform/types';

const TYPE_ICONS: Record<ConsultationType, any> = {
  VIDEO: Video,
  PHONE: Phone,
  IN_PERSON: MapPin,
};

export default function ConsultationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const consultationId = params.id as string;

  const { data: consultation, isLoading, error } = useConsultation(consultationId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleJoinMeeting = () => {
    if (consultation?.meetingLink) {
      Linking.openURL(consultation.meetingLink);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading consultation details...</Text>
      </View>
    );
  }

  if (error || !consultation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Consultation not found</Text>
        <TouchableOpacity
          style={styles.backToListButton}
          onPress={() => router.push('/consultations/my-bookings')}
        >
          <Text style={styles.backToListButtonText}>Back to My Consultations</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const TypeIcon = TYPE_ICONS[consultation.type];
  const isUpcoming = new Date(consultation.scheduledAt) >= new Date();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Consultation Details</Text>
          <Text style={styles.subtitle}>{isUpcoming ? 'Upcoming' : 'Past'}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{consultation.status}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Meeting Link (if video and upcoming) */}
        {consultation.type === 'VIDEO' && consultation.meetingLink && isUpcoming && (
          <TouchableOpacity
            style={styles.meetingCard}
            onPress={handleJoinMeeting}
            activeOpacity={0.8}
          >
            <Video color="#667eea" size={24} />
            <View style={styles.meetingCardContent}>
              <Text style={styles.meetingCardTitle}>Video Consultation</Text>
              <Text style={styles.meetingCardSubtitle}>Tap to join meeting</Text>
            </View>
            <ExternalLink color="#667eea" size={20} />
          </TouchableOpacity>
        )}

        {/* Schedule Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Calendar color="#111827" size={20} /> Schedule
          </Text>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{formatDate(consultation.scheduledAt)}</Text>
              <Text style={styles.infoValue}>{formatTime(consultation.scheduledAt)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duration</Text>
              <View style={styles.infoValueRow}>
                <Clock color="#6b7280" size={16} />
                <Text style={styles.infoValue}>{consultation.duration} minutes</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type</Text>
              <View style={styles.infoValueRow}>
                <TypeIcon color="#6b7280" size={16} />
                <Text style={styles.infoValue}>{consultation.type}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fee</Text>
              <View style={styles.infoValueRow}>
                <DollarSign color="#6b7280" size={16} />
                <Text style={styles.infoValue}>₹{consultation.fee}</Text>
                <View style={[styles.paymentBadge, consultation.isPaid && styles.paymentBadgePaid]}>
                  <Text style={styles.paymentBadgeText}>
                    {consultation.isPaid ? 'Paid' : 'Unpaid'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Doctor Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Stethoscope color="#111827" size={20} /> Doctor Information
          </Text>
          <View style={styles.cardContent}>
            <View style={styles.doctorInfo}>
              {consultation.doctor?.imageUrl ? (
                <Image
                  source={{ uri: consultation.doctor.imageUrl }}
                  style={styles.doctorImageLarge}
                />
              ) : (
                <View style={styles.doctorImageLargePlaceholder}>
                  <Text style={styles.doctorImageLargeText}>
                    {consultation.doctor?.name.charAt(0)}
                  </Text>
                </View>
              )}
              <View style={styles.doctorInfoContent}>
                <Text style={styles.doctorNameLarge}>{consultation.doctor?.name}</Text>
                <Text style={styles.doctorSpecLarge}>{consultation.doctor?.specialization}</Text>
                {consultation.doctor?.experience && (
                  <Text style={styles.doctorExperience}>
                    {consultation.doctor.experience} years experience
                  </Text>
                )}
              </View>
            </View>

            {consultation.doctor?.bio && (
              <View style={styles.doctorBioSection}>
                <Text style={styles.doctorBioTitle}>About</Text>
                <Text style={styles.doctorBioText}>{consultation.doctor.bio}</Text>
              </View>
            )}

            {consultation.doctor?.qualifications && consultation.doctor.qualifications.length > 0 && (
              <View style={styles.qualificationsSection}>
                <Text style={styles.qualificationsTitle}>Qualifications</Text>
                {consultation.doctor.qualifications.map((qual, index) => (
                  <View key={index} style={styles.qualificationItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.qualificationText}>{qual}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Notes & Prescription (if completed) */}
        {consultation.status === 'COMPLETED' && (consultation.notes || consultation.prescription) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <FileText color="#111827" size={20} /> Consultation Summary
            </Text>
            <View style={styles.cardContent}>
              {consultation.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesTitle}>Consultation Notes</Text>
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>{consultation.notes}</Text>
                  </View>
                </View>
              )}

              {consultation.prescription && (
                <View style={styles.prescriptionSection}>
                  <Text style={styles.prescriptionTitle}>Prescription</Text>
                  <View style={styles.prescriptionBox}>
                    <Text style={styles.prescriptionText}>{consultation.prescription}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Metadata */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <View style={styles.cardContent}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Booking ID</Text>
              <Text style={styles.metaValue}>{consultation.id.slice(0, 12)}...</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Booked On</Text>
              <Text style={styles.metaValue}>
                {new Date(consultation.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 16,
  },
  backToListButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backToListButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  headerBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  meetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#c4b5fd',
  },
  meetingCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  meetingCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5b21b6',
    marginBottom: 2,
  },
  meetingCardSubtitle: {
    fontSize: 13,
    color: '#7c3aed',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  paymentBadgePaid: {
    backgroundColor: '#d1fae5',
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  doctorInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorImageLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  doctorImageLargePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  doctorImageLargeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  doctorInfoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorNameLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  doctorSpecLarge: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  doctorExperience: {
    fontSize: 13,
    color: '#9ca3af',
  },
  doctorBioSection: {
    marginTop: 4,
  },
  doctorBioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  doctorBioText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  qualificationsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  qualificationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  qualificationItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 13,
    color: '#667eea',
    marginRight: 8,
  },
  qualificationText: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  notesSection: {
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  notesBox: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  prescriptionSection: {
    marginTop: 12,
  },
  prescriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  prescriptionBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  prescriptionText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metaLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
});

