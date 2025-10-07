'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Palette,
  Monitor,
  CheckCircle,
  AlertCircle,
  Save,
  RotateCcw
} from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'es' | 'fr';
type TimeFormat = '12h' | '24h';
type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  labResultUpdates: boolean;
  actionPlanReminders: boolean;
  healthInsights: boolean;
  weeklyReports: boolean;
  marketingEmails: boolean;
}

interface PrivacySettings {
  dataSharing: boolean;
  analyticsTracking: boolean;
  personalizedRecommendations: boolean;
  researchParticipation: boolean;
}

const defaultNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  labResultUpdates: true,
  actionPlanReminders: true,
  healthInsights: true,
  weeklyReports: false,
  marketingEmails: false,
};

const defaultPrivacySettings: PrivacySettings = {
  dataSharing: false,
  analyticsTracking: true,
  personalizedRecommendations: true,
  researchParticipation: false,
};

export function SettingsPreferences() {
  const [theme, setTheme] = useState<Theme>('system');
  const [language, setLanguage] = useState<Language>('en');
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h');
  const [dateFormat, setDateFormat] = useState<DateFormat>('MM/DD/YYYY');
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotificationSettings);
  const [privacy, setPrivacy] = useState<PrivacySettings>(defaultPrivacySettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // TODO: Implement actual API call to save settings
      // await settingsService.updateSettings({
      //   theme,
      //   language,
      //   timeFormat,
      //   dateFormat,
      //   notifications,
      //   privacy
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setTheme('system');
    setLanguage('en');
    setTimeFormat('12h');
    setDateFormat('MM/DD/YYYY');
    setNotifications(defaultNotificationSettings);
    setPrivacy(defaultPrivacySettings);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const updateNotification = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const updatePrivacy = (key: keyof PrivacySettings, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Settings & Preferences</h2>
          <p className="text-sm text-gray-600">Customize your experience and manage your preferences.</p>
        </div>
        
        <div className="flex space-x-3">
          <Button onClick={handleResetSettings} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} size="sm" disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <p>{saveError}</p>
        </Alert>
      )}

      {saveSuccess && (
        <Alert>
          <CheckCircle className="w-4 h-4" />
          <p>Settings saved successfully!</p>
        </Alert>
      )}

      {/* Appearance Settings */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Palette className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light' as Theme, label: 'Light', icon: Sun },
                { value: 'dark' as Theme, label: 'Dark', icon: Moon },
                { value: 'system' as Theme, label: 'System', icon: Monitor },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      isSelected ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Language & Region */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Globe className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Language & Region</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="time-format-select" className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
            <select
              id="time-format-select"
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value as TimeFormat)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="12h">12-hour (AM/PM)</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="date-format-select" className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select
              id="date-format-select"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value as DateFormat)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Bell className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
              <p className="text-xs text-gray-600">Receive notifications via email</p>
            </div>
            <button
              onClick={() => updateNotification('emailNotifications', !notifications.emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
              <p className="text-xs text-gray-600">Receive push notifications on your device</p>
            </div>
            <button
              onClick={() => updateNotification('pushNotifications', !notifications.pushNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Lab Result Updates</h4>
              <p className="text-xs text-gray-600">Get notified when lab results are processed</p>
            </div>
            <button
              onClick={() => updateNotification('labResultUpdates', !notifications.labResultUpdates)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.labResultUpdates ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.labResultUpdates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Action Plan Reminders</h4>
              <p className="text-xs text-gray-600">Reminders for action plan items</p>
            </div>
            <button
              onClick={() => updateNotification('actionPlanReminders', !notifications.actionPlanReminders)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.actionPlanReminders ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.actionPlanReminders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Health Insights</h4>
              <p className="text-xs text-gray-600">Notifications about new health insights</p>
            </div>
            <button
              onClick={() => updateNotification('healthInsights', !notifications.healthInsights)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.healthInsights ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.healthInsights ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
              <p className="text-xs text-gray-600">Weekly summary of your health progress</p>
            </div>
            <button
              onClick={() => updateNotification('weeklyReports', !notifications.weeklyReports)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.weeklyReports ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Marketing Emails</h4>
              <p className="text-xs text-gray-600">Product updates and promotional content</p>
            </div>
            <button
              onClick={() => updateNotification('marketingEmails', !notifications.marketingEmails)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Privacy & Data */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Settings className="w-5 h-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Privacy & Data</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Data Sharing</h4>
              <p className="text-xs text-gray-600">Allow sharing of anonymized data for research</p>
            </div>
            <button
              onClick={() => updatePrivacy('dataSharing', !privacy.dataSharing)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.dataSharing ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Analytics Tracking</h4>
              <p className="text-xs text-gray-600">Help improve the app with usage analytics</p>
            </div>
            <button
              onClick={() => updatePrivacy('analyticsTracking', !privacy.analyticsTracking)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.analyticsTracking ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.analyticsTracking ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Personalized Recommendations</h4>
              <p className="text-xs text-gray-600">AI-powered health recommendations</p>
            </div>
            <button
              onClick={() => updatePrivacy('personalizedRecommendations', !privacy.personalizedRecommendations)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.personalizedRecommendations ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.personalizedRecommendations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Research Participation</h4>
              <p className="text-xs text-gray-600">Participate in health research studies</p>
            </div>
            <button
              onClick={() => updatePrivacy('researchParticipation', !privacy.researchParticipation)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.researchParticipation ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.researchParticipation ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Current Settings Summary */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Settings Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Theme:</span>
            <Badge variant="outline" className="ml-2">
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </Badge>
          </div>
          
          <div>
            <span className="text-gray-600">Language:</span>
            <Badge variant="outline" className="ml-2">
              {language.toUpperCase()}
            </Badge>
          </div>
          
          <div>
            <span className="text-gray-600">Time Format:</span>
            <Badge variant="outline" className="ml-2">
              {timeFormat}
            </Badge>
          </div>
          
          <div>
            <span className="text-gray-600">Date Format:</span>
            <Badge variant="outline" className="ml-2">
              {dateFormat}
            </Badge>
          </div>
          
          <div>
            <span className="text-gray-600">Email Notifications:</span>
            <Badge variant={notifications.emailNotifications ? "default" : "outline"} className="ml-2">
              {notifications.emailNotifications ? 'On' : 'Off'}
            </Badge>
          </div>
          
          <div>
            <span className="text-gray-600">Push Notifications:</span>
            <Badge variant={notifications.pushNotifications ? "default" : "outline"} className="ml-2">
              {notifications.pushNotifications ? 'On' : 'Off'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
