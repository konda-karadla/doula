'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';
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

interface ToggleSwitchProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

function ToggleSwitch({ label, description, enabled, onChange }: Readonly<ToggleSwitchProps>) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  // Load saved preferences from profile
  useEffect(() => {
    if (profile?.preferences) {
      console.log('[SettingsPreferences] Loading saved preferences:', profile.preferences);
      const prefs = profile.preferences as any;
      if (prefs.theme) setTheme(prefs.theme);
      if (prefs.language) setLanguage(prefs.language);
      if (prefs.timeFormat) setTimeFormat(prefs.timeFormat);
      if (prefs.dateFormat) setDateFormat(prefs.dateFormat);
      if (prefs.notifications) setNotifications(prefs.notifications);
      if (prefs.privacy) setPrivacy(prefs.privacy);
    }
  }, [profile]);

  const handleSaveSettings = async () => {
    console.log('[handleSaveSettings] Saving settings...', {
      theme, language, timeFormat, dateFormat, notifications, privacy
    });
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const result = await updateProfile.mutateAsync({
        preferences: {
          theme,
          language,
          timeFormat,
          dateFormat,
          notifications,
          privacy,
        },
      });
      console.log('[handleSaveSettings] Save success:', result);
      
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('[handleSaveSettings] Error:', error);
      setSaveError(error.message || 'Failed to save settings');
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
          <Button onClick={handleSaveSettings} size="sm" disabled={updateProfile.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
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
          <ToggleSwitch
            label="Email Notifications"
            description="Receive notifications via email"
            enabled={notifications.emailNotifications}
            onChange={(value) => updateNotification('emailNotifications', value)}
          />
          <ToggleSwitch
            label="Push Notifications"
            description="Receive push notifications on your device"
            enabled={notifications.pushNotifications}
            onChange={(value) => updateNotification('pushNotifications', value)}
          />
          <ToggleSwitch
            label="Lab Result Updates"
            description="Get notified when lab results are processed"
            enabled={notifications.labResultUpdates}
            onChange={(value) => updateNotification('labResultUpdates', value)}
          />
          <ToggleSwitch
            label="Action Plan Reminders"
            description="Reminders for action plan items"
            enabled={notifications.actionPlanReminders}
            onChange={(value) => updateNotification('actionPlanReminders', value)}
          />
          <ToggleSwitch
            label="Health Insights"
            description="Notifications about new health insights"
            enabled={notifications.healthInsights}
            onChange={(value) => updateNotification('healthInsights', value)}
          />
          <ToggleSwitch
            label="Weekly Reports"
            description="Weekly summary of your health progress"
            enabled={notifications.weeklyReports}
            onChange={(value) => updateNotification('weeklyReports', value)}
          />
          <ToggleSwitch
            label="Marketing Emails"
            description="Product updates and promotional content"
            enabled={notifications.marketingEmails}
            onChange={(value) => updateNotification('marketingEmails', value)}
          />
        </div>
      </Card>

      {/* Privacy & Data */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Settings className="w-5 h-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Privacy & Data</h3>
        </div>
        
        <div className="space-y-4">
          <ToggleSwitch
            label="Data Sharing"
            description="Allow sharing of anonymized data for research"
            enabled={privacy.dataSharing}
            onChange={(value) => updatePrivacy('dataSharing', value)}
          />
          <ToggleSwitch
            label="Analytics Tracking"
            description="Help improve the app with usage analytics"
            enabled={privacy.analyticsTracking}
            onChange={(value) => updatePrivacy('analyticsTracking', value)}
          />
          <ToggleSwitch
            label="Personalized Recommendations"
            description="AI-powered health recommendations"
            enabled={privacy.personalizedRecommendations}
            onChange={(value) => updatePrivacy('personalizedRecommendations', value)}
          />
          <ToggleSwitch
            label="Research Participation"
            description="Participate in health research studies"
            enabled={privacy.researchParticipation}
            onChange={(value) => updatePrivacy('researchParticipation', value)}
          />
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
