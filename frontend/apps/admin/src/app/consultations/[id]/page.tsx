'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminConsultation, useUpdateConsultation } from '@/hooks/use-admin-consultations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, User, Stethoscope, DollarSign } from 'lucide-react';
import type { ConsultationStatus } from '@health-platform/types';

const STATUS_OPTIONS: ConsultationStatus[] = [
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

export default function ConsultationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const consultationId = params.id as string;

  const { data: consultation, isLoading, error } = useAdminConsultation(consultationId);
  const updateConsultation = useUpdateConsultation();

  const [status, setStatus] = useState<ConsultationStatus>('SCHEDULED');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Initialize form with consultation data
  useState(() => {
    if (consultation) {
      setStatus(consultation.status);
      setNotes(consultation.notes || '');
      setPrescription(consultation.prescription || '');
      setMeetingLink(consultation.meetingLink || '');
    }
  });

  const handleUpdate = async () => {
    try {
      await updateConsultation.mutateAsync({
        id: consultationId,
        data: {
          status,
          notes: notes.trim() || undefined,
          prescription: prescription.trim() || undefined,
          meetingLink: meetingLink.trim() || undefined,
        },
      });
      setUpdateError('');
    } catch (error: any) {
      console.error('Failed to update consultation:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update consultation');
    }
  };

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading consultation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold">Failed to load consultation</p>
          <Button onClick={() => router.push('/consultations')} className="mt-4">
            Back to Consultations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/consultations')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Consultations
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultation Details</h1>
            <p className="text-gray-600 mt-1">ID: {consultation.id.slice(0, 8)}...</p>
          </div>
          <Badge variant={STATUS_COLORS[consultation.status] as any}>
            {STATUS_LABELS[consultation.status]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Consultation Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(consultation.scheduledAt)}
                  </p>
                  <p className="text-gray-600">{formatTime(consultation.scheduledAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">{consultation.duration} minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Consultation Fee</p>
                  <p className="font-medium text-gray-900">₹{consultation.fee}</p>
                  <p className="text-sm text-gray-600">
                    {consultation.isPaid ? '✅ Paid' : '❌ Unpaid'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Patient Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{consultation.user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{consultation.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Journey Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {consultation.user?.journeyType || 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          {/* Doctor Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Doctor Information
            </h2>
            <div className="flex items-center gap-4 mb-4">
              {consultation.doctor?.imageUrl ? (
                <img
                  src={consultation.doctor.imageUrl}
                  alt={consultation.doctor.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold text-xl">
                    {consultation.doctor?.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {consultation.doctor?.name}
                </p>
                <p className="text-gray-600">{consultation.doctor?.specialization}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="font-medium text-gray-900">
                  {consultation.doctor?.experience} years
                </p>
              </div>
              {consultation.doctor?.qualifications && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Qualifications</p>
                  <ul className="list-disc list-inside text-sm text-gray-900 space-y-1">
                    {consultation.doctor.qualifications.map((qual, i) => (
                      <li key={i}>{qual}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Update Form */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Consultation</h2>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ConsultationStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meeting Link */}
              <div>
                <Label htmlFor="meetingLink">Meeting Link</Label>
                <Input
                  id="meetingLink"
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Consultation Notes</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add consultation notes..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Prescription */}
              <div>
                <Label htmlFor="prescription">Prescription</Label>
                <textarea
                  id="prescription"
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="Add prescription details..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Error Message */}
              {updateError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{updateError}</p>
                </div>
              )}

              {/* Save Button */}
              <Button
                onClick={handleUpdate}
                disabled={updateConsultation.isPending}
                className="w-full"
              >
                {updateConsultation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>

              {/* Success Message */}
              {updateConsultation.isSuccess && !updateError && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm">✅ Consultation updated successfully</p>
                </div>
              )}
            </div>
          </Card>

          {/* Metadata */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Consultation Type</p>
                <p className="font-medium text-gray-900">{consultation.type}</p>
              </div>
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(consultation.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(consultation.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

