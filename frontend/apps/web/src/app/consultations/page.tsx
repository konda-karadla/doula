'use client';

import { useRouter } from 'next/navigation';
import { useMyConsultations } from '@/hooks/use-consultations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Stethoscope,
  CalendarCheck,
  ArrowRight,
  Plus,
  History,
} from 'lucide-react';

export default function ConsultationsHubPage() {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Consultations</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Connect with expert healthcare professionals and manage your appointments
        </p>
      </div>

      {/* Stats Bar */}
      {!isLoading && total > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{total}</div>
              <p className="text-sm text-gray-600 mt-1">Total Consultations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">{upcoming?.length || 0}</div>
              <p className="text-sm text-gray-600 mt-1">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-gray-600">{past?.length || 0}</div>
              <p className="text-sm text-gray-600 mt-1">Completed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Book New Consultation Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-100 hover:border-blue-300" onClick={() => router.push('/book-consultation')}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Book Consultation</CardTitle>
                <CardDescription className="mt-1">
                  Schedule with our healthcare experts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-600">
                Browse available doctors, check their specializations, and book appointments at your convenience.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarCheck className="h-4 w-4" />
                <span>Real-time availability</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>30-minute consultations</span>
              </div>
              <Button className="w-full mt-4" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Browse Doctors
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Consultations Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-100 hover:border-purple-300" onClick={() => router.push('/my-consultations')}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">My Consultations</CardTitle>
                <CardDescription className="mt-1">
                  View and manage your appointments
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-600">
                Track your upcoming appointments, view past consultations, and access meeting links.
              </p>
              
              {!isLoading && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="default" className="text-xs">
                      {upcoming?.length || 0} Upcoming
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {past?.length || 0} Past
                    </Badge>
                  </div>
                </>
              )}

              <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700" size="lg">
                <History className="h-5 w-5 mr-2" />
                View My Consultations
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Consultations Preview */}
      {!isLoading && upcoming && upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5" />
                Next Consultation
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/my-consultations')}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcoming.slice(0, 1).map((consultation) => (
              <div
                key={consultation.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/consultation/${consultation.id}`)}
              >
                {consultation.doctor?.imageUrl ? (
                  <img
                    src={consultation.doctor.imageUrl}
                    alt={consultation.doctor.name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-white shadow"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow">
                    <span className="text-white font-bold text-xl">
                      {consultation.doctor?.name.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {consultation.doctor?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {consultation.doctor?.specialization}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(consultation.scheduledAt)}
                        </div>
                        <Badge variant="default">{consultation.type}</Badge>
                        <Badge variant="default">{consultation.status}</Badge>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* How it Works */}
      <Card className="mt-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Browse Doctors</h4>
              <p className="text-sm text-gray-600">
                Explore our expert healthcare professionals
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Select Date & Time</h4>
              <p className="text-sm text-gray-600">
                Choose from available time slots
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Confirm Booking</h4>
              <p className="text-sm text-gray-600">
                Receive instant confirmation
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Attend Consultation</h4>
              <p className="text-sm text-gray-600">
                Join via video, phone, or in-person
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

