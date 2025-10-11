'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminConsultations } from '@/hooks/use-admin-consultations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Search, Eye } from 'lucide-react';
import type { Consultation, ConsultationStatus } from '@health-platform/types';

const STATUS_COLORS: Record<ConsultationStatus, string> = {
  SCHEDULED: 'default',
  CONFIRMED: 'default',
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  CANCELLED: 'secondary',
  NO_SHOW: 'destructive',
};

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
};

export default function ConsultationsPage() {
  const router = useRouter();
  const { data: consultations, isLoading, error } = useAdminConsultations();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter consultations
  const filteredConsultations = consultations?.filter((consultation) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      consultation.doctor?.name.toLowerCase().includes(query) ||
      consultation.user?.username.toLowerCase().includes(query) ||
      consultation.user?.email.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading consultations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold">Failed to load consultations</p>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultations</h1>
          <p className="text-gray-600 mt-1">View and manage all consultation bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by doctor or patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </select>

        <div className="text-sm text-gray-600">
          {filteredConsultations?.length || 0} consultation
          {filteredConsultations?.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Consultations Table */}
      {filteredConsultations && filteredConsultations.length > 0 ? (
        <div className="bg-white rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultations.map((consultation) => (
                <TableRow key={consultation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {consultation.user?.username}
                      </div>
                      <div className="text-sm text-gray-500">{consultation.user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {consultation.doctor?.imageUrl ? (
                        <img
                          src={consultation.doctor.imageUrl}
                          alt={consultation.doctor.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-semibold text-xs">
                            {consultation.doctor?.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {consultation.doctor?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {consultation.doctor?.specialization}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDate(consultation.scheduledAt)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(consultation.scheduledAt)} ({consultation.duration} min)
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">{consultation.type}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium text-gray-900">₹{consultation.fee}</span>
                      {consultation.isPaid && (
                        <Badge variant="default" className="ml-2 text-xs">
                          Paid
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[consultation.status] as any}>
                      {STATUS_LABELS[consultation.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/consultations/${consultation.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No consultations found' : 'No consultations yet'}
          </h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Consultations will appear here once patients start booking'}
          </p>
        </div>
      )}
    </div>
  );
}

