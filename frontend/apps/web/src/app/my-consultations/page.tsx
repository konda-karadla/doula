'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMyConsultations, useCancelConsultation } from '@/hooks/use-consultations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, Clock, Video, Phone, MapPin, Eye, XCircle } from 'lucide-react';
import type { Consultation, ConsultationStatus } from '@health-platform/types';

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

export default function MyConsultationsPage() {
  const router = useRouter();
  const { data: consultations, isLoading, error } = useMyConsultations();
  const cancelConsultation = useCancelConsultation();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [consultationToCancel, setConsultationToCancel] = useState<Consultation | null>(null);

  // Separate upcoming and past consultations
  const now = new Date();
  const upcoming = consultations?.filter(
    (c) => new Date(c.scheduledAt) >= now && c.status !== 'COMPLETED' && c.status !== 'CANCELLED'
  );
  const past = consultations?.filter(
    (c) => new Date(c.scheduledAt) < now || c.status === 'COMPLETED' || c.status === 'CANCELLED'
  );

  const handleCancel = async () => {
    if (!consultationToCancel) return;

    try {
      await cancelConsultation.mutateAsync(consultationToCancel.id);
      setCancelDialogOpen(false);
      setConsultationToCancel(null);
    } catch (error: any) {
      console.error('Failed to cancel:', error);
      alert(error.response?.data?.message || 'Failed to cancel consultation');
    }
  };

  const confirmCancel = (consultation: Consultation) => {
    setConsultationToCancel(consultation);
    setCancelDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  const canCancel = (consultation: Consultation) => {
    return ['SCHEDULED', 'CONFIRMED'].includes(consultation.status);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your consultations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <p className="text-red-800 font-semibold">Failed to load consultations</p>
          <p className="text-red-600 text-sm mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  const ConsultationCard = ({ consultation }: { consultation: Consultation }) => {
    const TypeIcon = TYPE_ICONS[consultation.type];

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {consultation.doctor?.imageUrl ? (
                <img
                  src={consultation.doctor.imageUrl}
                  alt={consultation.doctor.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {consultation.doctor?.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <CardTitle className="text-lg">{consultation.doctor?.name}</CardTitle>
                <CardDescription className="mt-1">
                  {consultation.doctor?.specialization}
                </CardDescription>
              </div>
            </div>
            <Badge variant={STATUS_COLORS[consultation.status]}>
              {consultation.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(consultation.scheduledAt)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {formatTime(consultation.scheduledAt)} ({consultation.duration} min)
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TypeIcon className="h-4 w-4" />
            <span>{consultation.type} Consultation</span>
          </div>

          <div className="pt-2 border-t flex items-center justify-between">
            <span className="text-sm text-gray-600">Fee:</span>
            <span className="text-lg font-bold text-gray-900">₹{consultation.fee}</span>
          </div>
        </CardContent>

        <CardFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/consultation/${consultation.id}`)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          {canCancel(consultation) && (
            <Button
              variant="outline"
              onClick={() => confirmCancel(consultation)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Consultations</h1>
        <p className="text-gray-600 text-lg">Manage your upcoming and past consultations</p>
      </div>

      {/* Quick Action */}
      <div className="mb-8">
        <Button onClick={() => router.push('/book-consultation')} size="lg">
          <Calendar className="h-5 w-5 mr-2" />
          Book New Consultation
        </Button>
      </div>

      {consultations && consultations.length > 0 ? (
        <div className="space-y-8">
          {/* Upcoming Consultations */}
          {upcoming && upcoming.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upcoming ({upcoming.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {upcoming.map((consultation) => (
                  <ConsultationCard key={consultation.id} consultation={consultation} />
                ))}
              </div>
            </div>
          )}

          {/* Past Consultations */}
          {past && past.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Past ({past.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {past.map((consultation) => (
                  <ConsultationCard key={consultation.id} consultation={consultation} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No consultations yet
            </h3>
            <p className="text-gray-600 mb-6">
              Book your first consultation with our expert doctors
            </p>
            <Button onClick={() => router.push('/book-consultation')}>
              Browse Doctors
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Consultation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your consultation with{' '}
              <strong>{consultationToCancel?.doctor?.name}</strong> on{' '}
              {consultationToCancel && formatDate(consultationToCancel.scheduledAt)}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Consultation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700"
              disabled={cancelConsultation.isPending}
            >
              {cancelConsultation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

