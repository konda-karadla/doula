'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile, useProfileStats } from '@/hooks/use-profile';
import { UserProfileForm } from '../../components/profile/user-profile-form';
import { HealthStatistics } from '../../components/profile/health-statistics';
import { DataExport } from '../../components/profile/data-export';
import { AccountSettings } from '../../components/profile/account-settings';
import { SettingsPreferences } from '../../components/profile/settings-preferences';
import { 
  User, 
  BarChart3, 
  Download, 
  Settings, 
  Shield,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Activity
} from 'lucide-react';

type ProfileTab = 'profile' | 'statistics' | 'export' | 'account' | 'preferences';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { data: stats, isLoading: statsLoading, error: statsError } = useProfileStats();

  const tabs = [
    { id: 'profile' as ProfileTab, label: 'Profile', icon: User },
    { id: 'statistics' as ProfileTab, label: 'Health Stats', icon: BarChart3 },
    { id: 'export' as ProfileTab, label: 'Data Export', icon: Download },
    { id: 'account' as ProfileTab, label: 'Account', icon: Shield },
    { id: 'preferences' as ProfileTab, label: 'Settings', icon: Settings },
  ];

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600">Unable to load your profile information. Please try again later.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile & Settings</h1>
        <p className="text-gray-600">Manage your profile, health statistics, and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{profile?.username || 'User'}</h3>
              <p className="text-sm text-gray-600">{profile?.email}</p>
              <Badge variant="secondary" className="mt-2">
                {profile?.profileType || 'Patient'}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Member since {new Date(profile?.createdAt || '').toLocaleDateString()}</span>
              </div>
              
              {profile?.journeyType && (
                <div className="flex items-center text-sm text-gray-600">
                  <Activity className="w-4 h-4 mr-2" />
                  <span>Journey: {profile.journeyType}</span>
                </div>
              )}

              {stats && (
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{stats.totalLabResults}</div>
                      <div className="text-xs text-gray-600">Lab Results</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats.totalActionPlans}</div>
                      <div className="text-xs text-gray-600">Action Plans</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'profile' && (
                <UserProfileForm profile={profile} />
              )}
              
              {activeTab === 'statistics' && (
                <HealthStatistics stats={stats} isLoading={statsLoading} error={statsError} />
              )}
              
              {activeTab === 'export' && (
                <DataExport />
              )}
              
              {activeTab === 'account' && (
                <AccountSettings profile={profile} />
              )}
              
              {activeTab === 'preferences' && (
                <SettingsPreferences />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
