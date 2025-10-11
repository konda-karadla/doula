'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDoctor, useDoctorAvailability, useBookConsultation } from '@/hooks/use-consultations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, Clock, DollarSign, Award, Star, CheckCircle } from 'lucide-react';
import type { ConsultationType } from '@health-platform/types';

const CONSULTATION_TYPES: { value: ConsultationType; label: string; description: string }[] = [
  { value: 'VIDEO', label: 'Video Call', description: 'Meet virtually via video' },
  { value: 'PHONE', label: 'Phone Call', description: 'Audio call consultation' },
  { value: 'IN_PERSON', label: 'In-Person', description: 'Visit clinic' },
];

export default function BookConsultationWithDoctorPage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.doctorId as string;

  const { data: doctor, isLoading: loadingDoctor } = useDoctor(doctorId);
  const bookConsultation = useBookConsultation();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<ConsultationType>('VIDEO');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  const { data: availableSlots, isLoading: loadingSlots } = useDoctorAvailability(
    doctorId,
    selectedDate
  );

  const handleBook = async () => {
    if (!selectedTime) {
      setError('Please select a time slot');
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
        router.push('/my-consultations');
      }, 2000);
    } catch (error: any) {
      console.error('Booking failed:', error);
      setError(error.response?.data?.message || 'Failed to book consultation. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group slots by morning/afternoon/evening
  const groupedSlots = availableSlots?.reduce((acc: any, slot) => {
    const hour = new Date(slot).getHours();
    if (hour < 12) {
      acc.morning.push(slot);
    } else if (hour < 17) {
      acc.afternoon.push(slot);
    } else {
      acc.evening.push(slot);
    }
    return acc;
  }, { morning: [], afternoon: [], evening: [] });

  if (loadingDoctor) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading doctor details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <p className="text-red-800 font-semibold">Doctor not found</p>
          <Button onClick={() => router.push('/book-consultation')} className="mt-4">
            Browse Doctors
          </Button>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your consultation with {doctor.name} has been scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-left bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">{doctor.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(selectedTime!)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{formatTime(selectedTime!)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{consultationType}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">Redirecting to your consultations...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/book-consultation')}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Doctors
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Doctor Info */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex flex-col items-center text-center">
                {doctor.imageUrl ? (
                  <img
                    src={doctor.imageUrl}
                    alt={doctor.name}
                    className="h-32 w-32 rounded-full object-cover border-4 border-gray-100 mb-4"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-4xl">
                      {doctor.name.charAt(0)}
                    </span>
                  </div>
                )}
                <CardTitle className="text-2xl">{doctor.name}</CardTitle>
                <CardDescription className="text-base font-medium mt-1">
                  {doctor.specialization}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Bio */}
              {doctor.bio && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-sm text-gray-600">{doctor.bio}</p>
                </div>
              )}

              {/* Experience */}
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {doctor.experience} years of experience
                </span>
              </div>

              {/* Qualifications */}
              {doctor.qualifications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Qualifications
                  </h3>
                  <ul className="space-y-1">
                    {doctor.qualifications.map((qual, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fee */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                  <span className="text-sm font-medium text-gray-700">Consultation Fee</span>
                  <span className="text-2xl font-bold text-blue-600">₹{doctor.consultationFee}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Consultation Type */}
          <Card>
            <CardHeader>
              <CardTitle>Select Consultation Type</CardTitle>
              <CardDescription>Choose how you'd like to consult</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CONSULTATION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setConsultationType(type.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      consultationType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>Choose a date for your consultation</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime(null); // Reset selected time when date changes
                }}
                min={today}
                className="w-full h-12 text-lg"
              />
              <p className="text-sm text-gray-600 mt-2">
                Selected: {formatDate(selectedDate)}
              </p>
            </CardContent>
          </Card>

          {/* Time Slot Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Time Slot</CardTitle>
              <CardDescription>
                {loadingSlots ? (
                  'Loading available slots...'
                ) : availableSlots && availableSlots.length > 0 ? (
                  `${availableSlots.length} slot${availableSlots.length !== 1 ? 's' : ''} available`
                ) : (
                  'No slots available for this date'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : availableSlots && availableSlots.length > 0 ? (
                <div className="space-y-4">
                  {/* Morning */}
                  {groupedSlots.morning.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Morning (Before 12 PM)
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {groupedSlots.morning.map((slot: string) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`p-3 border rounded-lg text-center transition-all ${
                              selectedTime === slot
                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                : 'border-gray-200 hover:border-blue-300 text-gray-700'
                            }`}
                          >
                            {formatTime(slot)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Afternoon */}
                  {groupedSlots.afternoon.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Afternoon (12 PM - 5 PM)
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {groupedSlots.afternoon.map((slot: string) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`p-3 border rounded-lg text-center transition-all ${
                              selectedTime === slot
                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                : 'border-gray-200 hover:border-blue-300 text-gray-700'
                            }`}
                          >
                            {formatTime(slot)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evening */}
                  {groupedSlots.evening.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Evening (After 5 PM)
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {groupedSlots.evening.map((slot: string) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`p-3 border rounded-lg text-center transition-all ${
                              selectedTime === slot
                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                : 'border-gray-200 hover:border-blue-300 text-gray-700'
                            }`}
                          >
                            {formatTime(slot)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No available slots for this date</p>
                  <p className="text-sm text-gray-500 mt-1">Please try another date</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Summary */}
          {selectedTime && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Doctor:</span>
                  <span className="font-medium text-gray-900">{doctor.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Date:</span>
                  <span className="font-medium text-gray-900">{formatDate(selectedTime)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Time:</span>
                  <span className="font-medium text-gray-900">{formatTime(selectedTime)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Type:</span>
                  <span className="font-medium text-gray-900">
                    {CONSULTATION_TYPES.find((t) => t.value === consultationType)?.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Duration:</span>
                  <span className="font-medium text-gray-900">30 minutes</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-3 border-t border-blue-200">
                  <span className="text-gray-900">Total Fee:</span>
                  <span className="text-blue-600">₹{doctor.consultationFee}</span>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleBook}
                  disabled={bookConsultation.isPending}
                  className="w-full mt-4 h-12"
                  size="lg"
                >
                  {bookConsultation.isPending ? 'Booking...' : 'Confirm Booking'}
                </Button>

                <p className="text-xs text-gray-600 text-center mt-2">
                  You'll receive a confirmation email with consultation details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

