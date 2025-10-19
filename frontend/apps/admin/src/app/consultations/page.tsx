'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';
import { ConsultationsDataTable } from './consultations-data-table';
import { mockConsultations, type AdminConsultation } from './mock-data';

export default function ConsultationsPage() {
  const router = useRouter();

  // Using mock data per request. Replace with hook when backend is ready.
  const consultations = mockConsultations;
  const isLoading = false;
  const error = null;

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredConsultations = useMemo(() => {
    if (!consultations) return [];
    
    return consultations.filter((consultation) => {
      const matchesStatus = filterStatus === 'all' || consultation.status === filterStatus;
      const matchesType = filterType === 'all' || consultation.type === filterType;
      
      return matchesStatus && matchesType;
    });
  }, [consultations, filterStatus, filterType]);

  const handleViewConsultation = (consultation: AdminConsultation) => {
    router.push(`/consultations/${consultation.id}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
            <p className="text-gray-600">View and manage all consultation bookings</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
            <CardDescription>Filter consultations by status and type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>
              <div>
                <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="filter-type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="VIDEO">Video</option>
                  <option value="AUDIO">Audio</option>
                  <option value="CHAT">Chat</option>
                  <option value="IN_PERSON">In Person</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterType('all');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultations Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Consultations ({filteredConsultations.length})</CardTitle>
                <CardDescription>View and manage consultation bookings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ConsultationsDataTable
              consultations={filteredConsultations}
              onView={handleViewConsultation}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

