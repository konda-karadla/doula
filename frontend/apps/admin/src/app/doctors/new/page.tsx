'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateDoctor } from '@/hooks/use-admin-doctors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, X } from 'lucide-react';
import type { CreateDoctorRequest } from '@health-platform/types';

export default function NewDoctorPage() {
  const router = useRouter();
  const createDoctor = useCreateDoctor();

  const [formData, setFormData] = useState<CreateDoctorRequest>({
    name: '',
    specialization: '',
    bio: '',
    qualifications: [''],
    experience: 0,
    consultationFee: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateDoctorRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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
      qualifications: [...prev.qualifications, ''],
    }));
  };

  const removeQualification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const updateQualification = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.qualifications];
      updated[index] = value;
      return { ...prev, qualifications: updated };
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Doctor name is required';
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    const validQualifications = formData.qualifications.filter((q) => q.trim());
    if (validQualifications.length === 0) {
      newErrors.qualifications = 'At least one qualification is required';
    }

    if (formData.experience < 0 || formData.experience > 60) {
      newErrors.experience = 'Experience must be between 0 and 60 years';
    }

    const fee = parseFloat(formData.consultationFee);
    if (isNaN(fee) || fee <= 0) {
      newErrors.consultationFee = 'Consultation fee must be a positive number';
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
      const validQualifications = formData.qualifications.filter((q) => q.trim());

      await createDoctor.mutateAsync({
        ...formData,
        qualifications: validQualifications,
      });

      // Navigate back to doctors list
      router.push('/doctors');
    } catch (error: any) {
      console.error('Failed to create doctor:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to create doctor. Please try again.',
      });
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Add New Doctor</h1>
        <p className="text-gray-600 mt-1">Create a new doctor profile</p>
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
              <Label htmlFor="name">
                Doctor Name <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="specialization">
                Specialization <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="bio">Bio (Optional)</Label>
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

            {formData.qualifications.map((qual, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={qual}
                  onChange={(e) => updateQualification(index, e.target.value)}
                  placeholder="MD - Johns Hopkins University"
                  className="flex-1"
                />
                {formData.qualifications.length > 1 && (
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
                <Label htmlFor="experience">
                  Years of Experience <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="consultationFee">
                  Consultation Fee (₹) <span className="text-red-500">*</span>
                </Label>
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
              <Label htmlFor="imageUrl">Profile Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="https://example.com/doctor-photo.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a URL to the doctor's profile photo. Leave blank for default avatar.
              </p>
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
            <Button type="submit" disabled={createDoctor.isPending}>
              {createDoctor.isPending ? 'Creating...' : 'Create Doctor'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

