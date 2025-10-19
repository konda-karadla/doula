'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDoctors } from '@/hooks/use-consultations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Star, Award } from 'lucide-react';
import type { Doctor } from '@health-platform/types';

export default function BookConsultationPage() {
  const router = useRouter();
  const { data: doctors, isLoading, error } = useDoctors();

  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');

  // Get unique specializations
  const specializations = Array.from(
    new Set(doctors?.map((d) => d.specialization) || [])
  );

  // Filter doctors
  const filteredDoctors = doctors?.filter((doctor) => {
    if (!doctor.isActive) return false;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialization.toLowerCase().includes(query) ||
      doctor.bio?.toLowerCase().includes(query);

    const matchesSpecialization =
      specializationFilter === 'all' || doctor.specialization === specializationFilter;

    return matchesSearch && matchesSpecialization;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <p className="text-red-800 font-semibold">Failed to load doctors</p>
          <p className="text-red-600 text-sm mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Book a Consultation</h1>
        <p className="text-gray-600 text-lg">
          Connect with our expert healthcare professionals
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name, specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        <div className="text-center mt-4 text-sm text-gray-600">
          {filteredDoctors?.length || 0} doctor{filteredDoctors?.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors && filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  {doctor.imageUrl ? (
                    <img
                      src={doctor.imageUrl}
                      alt={doctor.name}
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {doctor.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1 group-hover:text-blue-600 transition-colors">
                      {doctor.name}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-gray-600">
                      {doctor.specialization}
                    </CardDescription>
                  </div>
                </div>

                {doctor.bio && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {doctor.bio}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Experience */}
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{doctor.experience} years experience</span>
                </div>

                {/* Qualifications */}
                {doctor.qualifications.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Star className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 line-clamp-2">
                      {doctor.qualifications[0]}
                      {doctor.qualifications.length > 1 &&
                        ` +${doctor.qualifications.length - 1} more`}
                    </span>
                  </div>
                )}

                {/* Fee */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Consultation Fee</span>
                    <span className="text-2xl font-bold text-gray-900">₹{doctor.consultationFee}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => router.push(`/book-consultation/${doctor.id}`)}
                  className="w-full gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Book Consultation
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || specializationFilter !== 'all'
              ? 'No doctors found'
              : 'No doctors available'}
          </h3>
          <p className="text-gray-600">
            {searchQuery || specializationFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'Please check back later'}
          </p>
        </div>
      )}
    </div>
  );
}

