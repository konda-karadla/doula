'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAdminDoctors,
  useDeleteDoctor,
  useToggleDoctor,
} from '@/hooks/use-admin-doctors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Pencil, Power, Trash2, Clock, Search } from 'lucide-react';
import type { Doctor } from '@health-platform/types';

export default function DoctorsPage() {
  const router = useRouter();
  const { data: doctors, isLoading, error } = useAdminDoctors();
  const deleteDoctor = useDeleteDoctor();
  const toggleDoctor = useToggleDoctor();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  // Filter doctors based on search
  const filteredDoctors = doctors?.filter((doctor) => {
    const query = searchQuery.toLowerCase();
    return (
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialization.toLowerCase().includes(query)
    );
  });

  const handleDelete = async () => {
    if (!doctorToDelete) return;

    try {
      await deleteDoctor.mutateAsync(doctorToDelete.id);
      setDeleteDialogOpen(false);
      setDoctorToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete doctor:', error);
      alert(error.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const handleToggle = async (doctor: Doctor) => {
    try {
      await toggleDoctor.mutateAsync(doctor.id);
    } catch (error: any) {
      console.error('Failed to toggle doctor status:', error);
      alert(error.response?.data?.message || 'Failed to update doctor status');
    }
  };

  const confirmDelete = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-600 mt-1">
            Manage doctors and their availability schedules
          </p>
        </div>
        <Button onClick={() => router.push('/doctors/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-600">
          {filteredDoctors?.length || 0} doctor{filteredDoctors?.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Doctors Table */}
      {filteredDoctors && filteredDoctors.length > 0 ? (
        <div className="bg-white rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Consultations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {doctor.imageUrl ? (
                        <img
                          src={doctor.imageUrl}
                          alt={doctor.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-semibold text-sm">
                            {doctor.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{doctor.name}</div>
                        <div className="text-sm text-gray-500">
                          {doctor.qualifications?.[0] || 'No qualifications listed'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900">{doctor.specialization}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">{doctor.experience} years</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">₹{doctor.consultationFee}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">
                      {doctor._count?.consultations || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={doctor.isActive ? 'default' : 'secondary'}>
                      {doctor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push(`/doctors/${doctor.id}`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Doctor
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/doctors/${doctor.id}/availability`)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Set Availability
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle(doctor)}>
                          <Power className="mr-2 h-4 w-4" />
                          {doctor.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => confirmDelete(doctor)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Doctor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No doctors found' : 'No doctors yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first doctor'}
          </p>
          {!searchQuery && (
            <Button onClick={() => router.push('/doctors/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Doctor
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{doctorToDelete?.name}</strong>? This action
              cannot be undone. The doctor must not have any upcoming consultations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteDoctor.isPending}
            >
              {deleteDoctor.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

