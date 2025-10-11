'use client';

import { useRouter, useParams } from 'next/navigation';
import { useConsultation } from '@/hooks/use-consultations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Link as LinkIcon,
} from 'lucide-react';
import type { ConsultationStatus } from '@health-platform/types';

const STATUS_COLORS: Record<ConsultationStatus, 'default' | 'secondary' | 'destructive'> = {
  SCHEDULED: 'default',
  CONFIRMED: 'default',
  IN_PROGRESS: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
  NO_SHOW: 'destructive',
};

const TYPE_ICONS = {
  VIDEO: Video,
  PHONE: Phone,
  IN_PERSON: MapPin,
};

export default function ConsultationDetailPage() {
  const router = useRouter();
  const params = useParams();
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading consultation details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <p className="text-red-800 font-semibold">Consultation not found</p>
          <Button onClick={() => router.push('/my-consultations')} className="mt-4">
            Back to My Consultations
          </Button>
        </div>
      </div>
    );
  }

  const TypeIcon = TYPE_ICONS[consultation.type];
  const isUpcoming = new Date(consultation.scheduledAt) >= new Date();

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/my-consultations')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Consultations
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultation Details</h1>
            <p className="text-gray-600 mt-1">
              {isUpcoming ? 'Upcoming consultation' : 'Past consultation'}
            </p>
          </div>
          <Badge variant={STATUS_COLORS[consultation.status]}>
            {consultation.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(consultation.scheduledAt)}
                </p>
                <p className="text-gray-700">{formatTime(consultation.scheduledAt)}</p>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <p className="font-medium text-gray-900">{consultation.duration} minutes</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TypeIcon className="h-4 w-4 text-gray-400" />
                    <p className="font-medium text-gray-900">{consultation.type}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Fee</p>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <p className="font-medium text-gray-900">₹{consultation.fee}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                {consultation.doctor?.imageUrl ? (
                  <img
                    src={consultation.doctor.imageUrl}
                    alt={consultation.doctor.name}
                    className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {consultation.doctor?.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {consultation.doctor?.name}
                  </h3>
                  <p className="text-gray-600">{consultation.doctor?.specialization}</p>
                  {consultation.doctor?.experience && (
                    <p className="text-sm text-gray-500 mt-1">
                      {consultation.doctor.experience} years of experience
                    </p>
                  )}
                </div>
              </div>

              {consultation.doctor?.bio && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-sm text-gray-600">{consultation.doctor.bio}</p>
                </div>
              )}

              {consultation.doctor?.qualifications && consultation.doctor.qualifications.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Qualifications</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {consultation.doctor.qualifications.map((qual, i) => (
                      <li key={i}>{qual}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes & Prescription (if consultation completed) */}
          {consultation.status === 'COMPLETED' && (consultation.notes || consultation.prescription) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Consultation Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {consultation.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Consultation Notes</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {consultation.notes}
                      </p>
                    </div>
                  </div>
                )}

                {consultation.prescription && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Prescription</h4>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {consultation.prescription}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meeting Link (if video consultation) */}
          {consultation.type === 'VIDEO' && consultation.meetingLink && isUpcoming && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Call
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800 mb-3">
                  Join the video consultation using the link below
                </p>
                <Button
                  onClick={() => window.open(consultation.meetingLink!, '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-bold text-gray-900">₹{consultation.fee}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={consultation.isPaid ? 'default' : 'secondary'}>
                    {consultation.isPaid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Booking ID</p>
                <p className="font-mono text-gray-900">{consultation.id.slice(0, 12)}...</p>
              </div>
              <div>
                <p className="text-gray-600">Booked On</p>
                <p className="text-gray-900">
                  {new Date(consultation.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

