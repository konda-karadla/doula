'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Filter } from 'lucide-react';
import { DoctorsDataTable } from './doctors-data-table';
import { mockDoctors, type AdminDoctor } from './mock-data';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';

export default function DoctorsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Using mock data per request. Replace with hook when backend is ready.
  const doctors = mockDoctors;
  const isLoading = false;
  const error = null;
  const deleteDoctor = { isPending: false, mutateAsync: async (_id: string) => {} };
  const toggleDoctor = { isPending: false, mutateAsync: async (_id: string) => {} };

  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<AdminDoctor | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState<AdminDoctor[]>([]);

  const filteredDoctors = useMemo(() => {
    if (!doctors) return [];
    
    return doctors.filter((doctor) => {
      const matchesSpecialization = filterSpecialization === 'all' || doctor.specialization === filterSpecialization;
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? doctor.isActive : !doctor.isActive);
      
      return matchesSpecialization && matchesStatus;
    });
  }, [doctors, filterSpecialization, filterStatus]);

  const handleDeleteDoctor = (doctor: AdminDoctor) => {
    setDoctorToDelete(doctor);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    try {
      await deleteDoctor.mutateAsync(doctorToDelete.id);
      toast({
        title: 'Doctor deleted',
        description: `${doctorToDelete.name} has been deleted successfully`,
      });
    } catch (error) {
      console.error('Failed to delete doctor:', error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete doctor',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedDoctors.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedDoctors.map((d) => deleteDoctor.mutateAsync(d.id)));
      toast({
        title: 'Doctors deleted',
        description: `${selectedDoctors.length} doctor(s) have been deleted successfully`,
      });
      setSelectedDoctors([]);
    } catch (error) {
      console.error('Failed to delete doctors:', error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete doctors',
        variant: 'destructive',
      });
    }
  };

  const handleEditDoctor = (doctor: AdminDoctor) => {
    router.push(`/doctors/${doctor.id}`);
  };

  const handleSetAvailability = (doctor: AdminDoctor) => {
    router.push(`/doctors/${doctor.id}/availability`);
  };

  const handleToggleDoctor = async (doctor: AdminDoctor) => {
    try {
      await toggleDoctor.mutateAsync(doctor.id);
      toast({
        title: 'Status updated',
        description: `${doctor.name} is now ${doctor.isActive ? 'inactive' : 'active'}`,
      });
    } catch (error) {
      console.error('Failed to toggle doctor status:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update doctor status',
        variant: 'destructive',
      });
    }
  };

  const uniqueSpecializations = Array.from(new Set(mockDoctors.map((d) => d.specialization))).sort((a, b) => a.localeCompare(b));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
            <p className="text-gray-600">Manage doctors and their availability schedules</p>
          </div>
          <Button onClick={() => router.push('/doctors/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Doctor
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
            <CardDescription>Filter doctors by specialization and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="filter-specialization" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <select
                  id="filter-specialization"
                  value={filterSpecialization}
                  onChange={(e) => setFilterSpecialization(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Specializations</option>
                  {uniqueSpecializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterSpecialization('all');
                    setFilterStatus('all');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctors Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Doctors ({filteredDoctors.length})</CardTitle>
                <CardDescription>Manage doctor profiles and schedules</CardDescription>
              </div>
              {selectedDoctors.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedDoctors.length} selected
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DoctorsDataTable
              doctors={filteredDoctors}
              onEdit={handleEditDoctor}
              onSetAvailability={handleSetAvailability}
              onToggle={handleToggleDoctor}
              onDelete={handleDeleteDoctor}
              onSelectionChange={setSelectedDoctors}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Doctor"
        description={
          doctorToDelete
            ? `Are you sure you want to delete ${doctorToDelete.name}? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDeleteDoctor}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Multiple Doctors"
        description={`Are you sure you want to delete ${selectedDoctors.length} doctor(s)? This action cannot be undone.`}
        confirmText={`Delete ${selectedDoctors.length} doctor(s)`}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}

