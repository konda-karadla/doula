'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { useUpdateProfile } from '@/hooks/use-profile';
import { 
  User, 
  MapPin, 
  Edit3, 
  Save, 
  X,
  Activity,
  Shield
} from 'lucide-react';
import type { UserProfile } from '@health-platform/types';

const profileSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Invalid email address',
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileFormProps {
  readonly profile?: UserProfile | null;
}

export function UserProfileForm({ profile }: UserProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      email: profile?.email || '',
      firstName: (profile as any)?.firstName || '',
      lastName: (profile as any)?.lastName || '',
      phone: (profile as any)?.phoneNumber || '',
      address: '',
      dateOfBirth: (profile as any)?.dateOfBirth ? new Date((profile as any).dateOfBirth).toISOString().split('T')[0] : '',
      emergencyContact: (profile as any)?.emergencyContactName || '',
      emergencyPhone: (profile as any)?.emergencyContactPhone || '',
      medicalConditions: '',
      medications: '',
      allergies: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    console.log('[UserProfileForm] Submitting form data:', data);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Update profile with all form fields
      const updatePayload: any = {
        email: data.email,
        profileType: profile?.profileType,
        journeyType: profile?.journeyType,
      };
      
      // Only include optional fields if they have values
      if (data.firstName) updatePayload.firstName = data.firstName;
      if (data.lastName) updatePayload.lastName = data.lastName;
      if (data.phone) updatePayload.phoneNumber = data.phone;
      if (data.emergencyContact) updatePayload.emergencyContactName = data.emergencyContact;
      if (data.emergencyPhone) updatePayload.emergencyContactPhone = data.emergencyPhone;
      
      // Convert date to ISO 8601 if provided
      if (data.dateOfBirth) {
        try {
          const date = new Date(data.dateOfBirth);
          if (!isNaN(date.getTime())) {
            updatePayload.dateOfBirth = date.toISOString();
          }
        } catch (e) {
          console.warn('[UserProfileForm] Invalid date format, skipping dateOfBirth');
        }
      }
      
      console.log('[UserProfileForm] Sending update:', updatePayload);
      
      const result = await updateProfile.mutateAsync(updatePayload);
      console.log('[UserProfileForm] Update success:', result);
      
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('[UserProfileForm] Update error:', error);
      console.error('[UserProfileForm] Error details:', {
        statusCode: error.statusCode,
        message: error.message,
        error: error.error,
        validation: error.message, // This is the validation errors array
      });
      
      // Log each validation error individually
      if (Array.isArray(error.message)) {
        console.error('[UserProfileForm] Validation errors:');
        error.message.forEach((msg: string, idx: number) => {
          console.error(`  ${idx + 1}. ${msg}`);
        });
      }
      
      const errorMsg = Array.isArray(error.message) 
        ? error.message.join(', ') 
        : error.message || 'Failed to update profile';
      setSaveError(errorMsg);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaveError(null);
    setSaveSuccess(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          <p className="text-sm text-gray-600">Manage your personal details and contact information.</p>
        </div>
        
        {!isEditing ? (
          <Button onClick={handleEdit} variant="outline" size="sm">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button 
              onClick={handleCancel}
              variant="outline"
              size="sm"
              disabled={updateProfile.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit(onSubmit)} 
              size="sm"
              disabled={!isDirty || updateProfile.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {saveError && (
        <Alert variant="destructive">
          <p>{saveError}</p>
        </Alert>
      )}

      {saveSuccess && (
        <Alert>
          <p>Profile updated successfully!</p>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                {...register('username')}
                disabled={!isEditing}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                disabled={!isEditing}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                disabled={!isEditing}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register('address')}
                disabled={!isEditing}
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  {...register('emergencyContact')}
                  disabled={!isEditing}
                  placeholder="Emergency contact name"
                />
              </div>

              <div>
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  {...register('emergencyPhone')}
                  disabled={!isEditing}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Medical Information */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Activity className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="medicalConditions">Medical Conditions</Label>
              <textarea
                id="medicalConditions"
                {...register('medicalConditions')}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="List any medical conditions..."
              />
            </div>

            <div>
              <Label htmlFor="medications">Current Medications</Label>
              <textarea
                id="medications"
                {...register('medications')}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="List current medications..."
              />
            </div>

            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <textarea
                id="allergies"
                {...register('allergies')}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="List any allergies..."
              />
            </div>
          </div>
        </Card>

        {/* Account Information (Read-only) */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Profile Type</Label>
              <div className="mt-1">
                <Badge variant="secondary">
                  {profile?.profileType || 'Patient'}
                </Badge>
              </div>
            </div>

            <div>
              <Label>Journey Type</Label>
              <div className="mt-1">
                <Badge variant="outline">
                  {profile?.journeyType || 'General'}
                </Badge>
              </div>
            </div>

            <div>
              <Label>Member Since</Label>
              <div className="mt-1 text-sm text-gray-600">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            <div>
              <Label>Last Updated</Label>
              <div className="mt-1 text-sm text-gray-600">
                {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
