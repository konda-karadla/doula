'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminDoctor, useUpdateDoctor } from '@/hooks/use-admin-doctors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X } from 'lucide-react';
import type { UpdateDoctorRequest } from '@health-platform/types';

export default function EditDoctorPage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.id as string;

  const { data: doctor, isLoading, error } = useAdminDoctor(doctorId);
  const updateDoctor = useUpdateDoctor();

  const [formData, setFormData] = useState<UpdateDoctorRequest>({
    name: '',
    specialization: '',
    bio: '',
    qualifications: [''],
    experience: 0,
    consultationFee: '',
    imageUrl: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with doctor data
  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name,
        specialization: doctor.specialization,
        bio: doctor.bio || '',
        qualifications: doctor.qualifications.length > 0 ? doctor.qualifications : [''],
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        imageUrl: doctor.imageUrl || '',
        isActive: doctor.isActive,
      });
    }
  }, [doctor]);

  const handleChange = (field: keyof UpdateDoctorRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [...(prev.qualifications || []), ''],
    }));
  };

  const removeQualification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: (prev.qualifications || []).filter((_, i) => i !== index),
    }));
  };

  const updateQualification = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...(prev.qualifications || [])];
      updated[index] = value;
      return { ...prev, qualifications: updated };
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.name && !formData.name.trim()) {
      newErrors.name = 'Doctor name cannot be empty';
    }

    if (formData.specialization && !formData.specialization.trim()) {
      newErrors.specialization = 'Specialization cannot be empty';
    }

    const validQualifications = (formData.qualifications || []).filter((q) => q.trim());
    if (formData.qualifications && validQualifications.length === 0) {
      newErrors.qualifications = 'At least one qualification is required';
    }

    if (formData.experience !== undefined && (formData.experience < 0 || formData.experience > 60)) {
      newErrors.experience = 'Experience must be between 0 and 60 years';
    }

    if (formData.consultationFee) {
      const fee = parseFloat(formData.consultationFee);
      if (isNaN(fee) || fee <= 0) {
        newErrors.consultationFee = 'Consultation fee must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // Filter out empty qualifications
      const validQualifications = (formData.qualifications || []).filter((q) => q.trim());

      const dataToSubmit = {
        ...formData,
        qualifications: validQualifications.length > 0 ? validQualifications : undefined,
      };

      await updateDoctor.mutateAsync({
        id: doctorId,
        data: dataToSubmit,
      });

      router.push('/doctors');
    } catch (error: any) {
      console.error('Failed to update doctor:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to update doctor. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading doctor details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold">Failed to load doctor</p>
          <p className="text-red-600 text-sm mt-2">
            {error instanceof Error ? error.message : 'Doctor not found'}
          </p>
          <Button onClick={() => router.push('/doctors')} className="mt-4">
            Back to Doctors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/doctors')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Doctor</h1>
            <p className="text-gray-600 mt-1">Update doctor profile information</p>
          </div>
          <Badge variant={doctor.isActive ? 'default' : 'secondary'}>
            {doctor.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* General Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
              General Information
            </h2>

            {/* Name */}
            <div>
              <Label htmlFor="name">Doctor Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Dr. Sarah Johnson"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Specialization */}
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => handleChange('specialization', e.target.value)}
                placeholder="Obstetrics & Gynecology"
                className={errors.specialization ? 'border-red-500' : ''}
              />
              {errors.specialization && (
                <p className="text-sm text-red-500 mt-1">{errors.specialization}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Board-certified specialist with 15+ years of experience..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Qualifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-900">Qualifications</h2>
              <Button type="button" onClick={addQualification} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Qualification
              </Button>
            </div>

            {(formData.qualifications || []).map((qual, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={qual}
                  onChange={(e) => updateQualification(index, e.target.value)}
                  placeholder="MD - Johns Hopkins University"
                  className="flex-1"
                />
                {(formData.qualifications?.length || 0) > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeQualification(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.qualifications && (
              <p className="text-sm text-red-500">{errors.qualifications}</p>
            )}
          </div>

          {/* Professional Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
              Professional Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Experience */}
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="60"
                  value={formData.experience}
                  onChange={(e) => handleChange('experience', parseInt(e.target.value) || 0)}
                  placeholder="15"
                  className={errors.experience ? 'border-red-500' : ''}
                />
                {errors.experience && (
                  <p className="text-sm text-red-500 mt-1">{errors.experience}</p>
                )}
              </div>

              {/* Consultation Fee */}
              <div>
                <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.consultationFee}
                  onChange={(e) => handleChange('consultationFee', e.target.value)}
                  placeholder="2500.00"
                  className={errors.consultationFee ? 'border-red-500' : ''}
                />
                {errors.consultationFee && (
                  <p className="text-sm text-red-500 mt-1">{errors.consultationFee}</p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <Label htmlFor="imageUrl">Profile Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="https://example.com/doctor-photo.jpg"
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-20 w-20 rounded-full object-cover border"
                  />
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Doctor is accepting consultations
              </Label>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/doctors')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateDoctor.isPending}>
              {updateDoctor.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

