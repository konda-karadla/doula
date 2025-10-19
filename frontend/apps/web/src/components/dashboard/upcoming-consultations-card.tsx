'use client';

import { useRouter } from 'next/navigation';
import { useMyConsultations } from '@/hooks/use-consultations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Stethoscope, ArrowRight, Plus } from 'lucide-react';

export function UpcomingConsultationsCard() {
  const router = useRouter();
  const { data: consultations, isLoading } = useMyConsultations();

  // Get only upcoming consultations
  const now = new Date();
  const upcoming = consultations?.filter(
    (c) =>
      new Date(c.scheduledAt) >= now &&
      c.status !== 'COMPLETED' &&
      c.status !== 'CANCELLED'
  ).slice(0, 3); // Show only next 3

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Consultations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Consultations
            </CardTitle>
            <CardDescription className="mt-1">
              Your scheduled appointments
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/consultations')}
          >
            <Plus className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcoming && upcoming.length > 0 ? (
          <div className="space-y-4">
            {upcoming.map((consultation) => (
              <div
                key={consultation.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/consultation/${consultation.id}`)}
              >
                {/* Doctor Photo */}
                {consultation.doctor?.imageUrl ? (
                  <img
                    src={consultation.doctor.imageUrl}
                    alt={consultation.doctor.name}
                    className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">
                      {consultation.doctor?.name.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {consultation.doctor?.name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {consultation.doctor?.specialization}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(consultation.scheduledAt)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatTime(consultation.scheduledAt)}
                    </div>
                  </div>
                </div>

                {/* Status & Arrow */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <Badge variant="default" className="text-xs">
                    {consultation.status}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}

            {consultations && consultations.length > 3 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/my-consultations')}
              >
                View All Consultations
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Stethoscope className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">No upcoming consultations</p>
            <Button onClick={() => router.push('/consultations')} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Book Consultation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

