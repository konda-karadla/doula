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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, Award, Calendar, Clock, CheckCircle, Video, Phone, MapPin } from 'lucide-react-native';
import { useDoctor, useDoctorAvailability, useBookConsultation } from '../../hooks/use-consultations';
import type { ConsultationType } from '@health-platform/types';
import DateTimePicker from '@react-native-community/datetimepicker';

const CONSULTATION_TYPES: { value: ConsultationType; label: string; icon: any }[] = [
  { value: 'VIDEO', label: 'Video Call', icon: Video },
  { value: 'PHONE', label: 'Phone Call', icon: Phone },
  { value: 'IN_PERSON', label: 'In-Person', icon: MapPin },
];

export default function DoctorBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const doctorId = params.doctorId as string;

  const { data: doctor, isLoading: loadingDoctor } = useDoctor(doctorId);
  const bookConsultation = useBookConsultation();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<ConsultationType>('VIDEO');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const dateString = selectedDate.toISOString().split('T')[0];
  const { data: availableSlots, isLoading: loadingSlots } = useDoctorAvailability(
    doctorId,
    dateString
  );

  const handleBook = async () => {
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    try {
      await bookConsultation.mutateAsync({
        doctorId,
        scheduledAt: selectedTime,
        duration: 30,
        type: consultationType,
      });

      setBookingSuccess(true);
      setTimeout(() => {
        router.push('/consultations/my-bookings');
      }, 2000);
    } catch (error: any) {
      Alert.alert(
        'Booking Failed',
        error.response?.data?.message || 'Failed to book consultation'
      );
    }
  };

  if (loadingDoctor) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading doctor details...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Doctor not found</Text>
      </View>
    );
  }

  if (bookingSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <CheckCircle color="#10b981" size={64} />
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your consultation with {doctor.name} has been scheduled
        </Text>
        <View style={styles.successDetails}>
          <Text style={styles.successDetailText}>
            {new Date(selectedTime!).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.successDetailText}>
            {new Date(selectedTime!).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <Text style={styles.redirectText}>Redirecting...</Text>
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
        <Text style={styles.headerTitle}>Book Consultation</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Info */}
        <View style={styles.doctorSection}>
          {doctor.imageUrl ? (
            <Image source={{ uri: doctor.imageUrl }} style={styles.doctorImageLarge} />
          ) : (
            <View style={styles.doctorImageLargePlaceholder}>
              <Text style={styles.doctorImageLargeText}>{doctor.name.charAt(0)}</Text>
            </View>
          )}
          <Text style={styles.doctorNameLarge}>{doctor.name}</Text>
          <Text style={styles.doctorSpecLarge}>{doctor.specialization}</Text>

          {doctor.bio && (
            <Text style={styles.doctorBioLarge}>{doctor.bio}</Text>
          )}

          <View style={styles.doctorMeta}>
            <View style={styles.metaItem}>
              <Award color="#667eea" size={18} />
              <Text style={styles.metaText}>{doctor.experience} years</Text>
            </View>
            {doctor.qualifications.length > 0 && (
              <View style={styles.metaItem}>
                <Star color="#fbbf24" size={18} />
                <Text style={styles.metaText}>{doctor.qualifications.length} qualifications</Text>
              </View>
            )}
          </View>
        </View>

        {/* Consultation Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Type</Text>
          <View style={styles.typeButtons}>
            {CONSULTATION_TYPES.map((type) => {
              const TypeIcon = type.icon;
              const isSelected = consultationType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.typeButton, isSelected && styles.typeButtonSelected]}
                  onPress={() => setConsultationType(type.value)}
                  activeOpacity={0.7}
                >
                  <TypeIcon color={isSelected ? '#667eea' : '#9ca3af'} size={24} />
                  <Text style={[styles.typeButtonText, isSelected && styles.typeButtonTextSelected]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar color="#667eea" size={20} />
            <Text style={styles.datePickerText}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setSelectedDate(date);
                  setSelectedTime(null); // Reset selected time
                }
              }}
            />
          )}
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          {loadingSlots ? (
            <View style={styles.slotsLoading}>
              <ActivityIndicator size="small" color="#667eea" />
              <Text style={styles.slotsLoadingText}>Loading slots...</Text>
            </View>
          ) : availableSlots && availableSlots.length > 0 ? (
            <View style={styles.timeSlots}>
              {availableSlots.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
                    onPress={() => setSelectedTime(slot)}
                    activeOpacity={0.7}
                  >
                    <Clock
                      color={isSelected ? '#fff' : '#667eea'}
                      size={16}
                    />
                    <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]}>
                      {new Date(slot).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.noSlots}>
              <Calendar color="#9ca3af" size={32} />
              <Text style={styles.noSlotsText}>No available slots</Text>
              <Text style={styles.noSlotsSubtext}>Please try another date</Text>
            </View>
          )}
        </View>

        {/* Booking Summary */}
        {selectedTime && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryDetails}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Doctor:</Text>
                <Text style={styles.summaryValue}>{doctor.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Type:</Text>
                <Text style={styles.summaryValue}>{consultationType}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration:</Text>
                <Text style={styles.summaryValue}>30 minutes</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total Fee:</Text>
                <Text style={styles.summaryTotalValue}>₹{doctor.consultationFee}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleBook}
              disabled={bookConsultation.isPending}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>
                {bookConsultation.isPending ? 'Booking...' : 'Confirm Booking'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 24,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  successDetails: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  successDetailText: {
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  redirectText: {
    fontSize: 13,
    color: '#9ca3af',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  doctorSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  doctorImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  doctorImageLargePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  doctorImageLargeText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  doctorNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  doctorSpecLarge: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  doctorBioLarge: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  doctorMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  typeButtonSelected: {
    borderColor: '#667eea',
    backgroundColor: '#ede9fe',
  },
  typeButtonText: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 6,
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: '#667eea',
    fontWeight: '600',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  slotsLoading: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  slotsLoadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
    minWidth: '30%',
  },
  timeSlotSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  noSlots: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  noSlotsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  noSlotsSubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  summary: {
    backgroundColor: '#ede9fe',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5b21b6',
    marginBottom: 16,
  },
  summaryDetails: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
    paddingTop: 16,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  confirmButton: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

