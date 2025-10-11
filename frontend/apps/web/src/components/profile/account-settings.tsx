'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Key, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  UserX,
  Mail
} from 'lucide-react';
import type { UserProfile } from '@health-platform/types';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const deleteAccountSchema = z.object({
  confirmText: z.string().refine((val) => val === 'DELETE', {
    message: 'Please type DELETE to confirm account deletion',
  }),
  reason: z.string().min(10, 'Please provide a reason for account deletion'),
});

type PasswordFormData = z.infer<typeof passwordSchema>;
type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

interface AccountSettingsProps {
  readonly profile?: UserProfile | null;
}

function PasswordChangeSection() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isDirty: isPasswordDirty },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handlePasswordChange = async () => {
    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      // TODO: Implement actual API call to change password
      // await authService.changePassword({
      //   currentPassword: data.currentPassword,
      //   newPassword: data.newPassword
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPasswordSuccess(true);
      resetPassword();
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <Key className="w-5 h-5 text-green-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
      </div>
      
      {passwordError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="w-4 h-4" />
          <p>{passwordError}</p>
        </Alert>
      )}

      {passwordSuccess && (
        <Alert className="mb-4">
          <CheckCircle className="w-4 h-4" />
          <p>Password changed successfully!</p>
        </Alert>
      )}

      <form onSubmit={handlePasswordSubmit(handlePasswordChange)} className="space-y-4">
        <div>
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative mt-1">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              {...registerPassword('currentPassword')}
              className={passwordErrors.currentPassword ? 'border-red-500' : ''}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordErrors.currentPassword && (
            <p className="text-sm text-red-600 mt-1">{passwordErrors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative mt-1">
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              {...registerPassword('newPassword')}
              className={passwordErrors.newPassword ? 'border-red-500' : ''}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordErrors.newPassword && (
            <p className="text-sm text-red-600 mt-1">{passwordErrors.newPassword.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              {...registerPassword('confirmPassword')}
              className={passwordErrors.confirmPassword ? 'border-red-500' : ''}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordErrors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">{passwordErrors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex space-x-3">
          <Button 
            type="submit" 
            disabled={!isPasswordDirty || isChangingPassword}
            className="bg-green-600 hover:bg-green-700"
          >
            {isChangingPassword ? (
              <>
                <Lock className="w-4 h-4 mr-2 animate-spin" />
                Changing...
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </>
            )}
          </Button>
          
          {isPasswordDirty && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => resetPassword()}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• At least 8 characters long</li>
          <li>• Contains uppercase and lowercase letters</li>
          <li>• Contains at least one number</li>
          <li>• Different from your current password</li>
        </ul>
      </div>
    </Card>
  );
}

function AccountDeletionSection() {
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    register: registerDelete,
    handleSubmit: handleDeleteSubmit,
    formState: { errors: deleteErrors },
    reset: resetDelete,
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
  });

  const handleAccountDeletion = async () => {
    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      // TODO: Implement actual API call to delete account
      // await authService.deleteAccount({
      //   reason: data.reason
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to login page or show success message
      window.location.href = '/login';
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    resetDelete();
    setDeleteError(null);
  };

  return (
    <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center mb-4">
          <Trash2 className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-lg font-medium text-red-900">Delete Account</h3>
        </div>
        
        <p className="text-sm text-red-700 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {!showDeleteConfirmation ? (
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteConfirmation(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <UserX className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        ) : (
          <div className="space-y-4">
            {deleteError && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <p>{deleteError}</p>
              </Alert>
            )}

            <form onSubmit={handleDeleteSubmit(handleAccountDeletion)} className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for deletion</Label>
                <textarea
                  id="reason"
                  {...registerDelete('reason')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Please tell us why you're deleting your account..."
                />
                {deleteErrors.reason && (
                  <p className="text-sm text-red-600 mt-1">{deleteErrors.reason.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmText">
                  Type <span className="font-mono font-bold">DELETE</span> to confirm
                </Label>
                <Input
                  id="confirmText"
                  {...registerDelete('confirmText')}
                  className={deleteErrors.confirmText ? 'border-red-500' : ''}
                  placeholder="DELETE"
                />
                {deleteErrors.confirmText && (
                  <p className="text-sm text-red-600 mt-1">{deleteErrors.confirmText.message}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="submit" 
                  variant="destructive"
                  disabled={isDeletingAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeletingAccount ? (
                    <>
                      <Trash2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Permanently Delete Account
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDeleteCancel}
                  disabled={isDeletingAccount}
                >
                  Cancel
                </Button>
              </div>
            </form>

            <div className="p-3 bg-red-100 rounded-lg">
              <h4 className="text-sm font-medium text-red-900 mb-2">Warning: This action will:</h4>
              <ul className="text-xs text-red-800 space-y-1">
                <li>• Permanently delete your account</li>
                <li>• Remove all your lab results and data</li>
                <li>• Delete all action plans and progress</li>
                <li>• Remove health insights and recommendations</li>
                <li>• Cannot be undone or recovered</li>
              </ul>
            </div>
          </div>
        )}
      </Card>
  );
}

export function AccountSettings({ profile }: AccountSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Settings</h2>
        <p className="text-sm text-gray-600">Manage your account security and preferences.</p>
      </div>

      {/* Account Information */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Email Address</Label>
            <div className="mt-1 flex items-center">
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-900">{profile?.email}</span>
            </div>
          </div>
          
          <div>
            <Label>Account Status</Label>
            <div className="mt-1">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
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
            <Label>Last Login</Label>
            <div className="mt-1 text-sm text-gray-600">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </Card>

      <PasswordChangeSection />

      {/* Two-Factor Authentication */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
          </div>
          <Badge variant="outline" className="bg-gray-100 text-gray-600">
            Not Enabled
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Add an extra layer of security to your account by enabling two-factor authentication.
        </p>
        
        <Button variant="outline" disabled>
          <Shield className="w-4 h-4 mr-2" />
          Enable 2FA (Coming Soon)
        </Button>
      </Card>

      <AccountDeletionSection />
    </div>
  );
}
