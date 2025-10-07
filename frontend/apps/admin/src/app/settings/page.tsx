'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Settings, Save, RefreshCw, ToggleRight, Shield, Database } from 'lucide-react'

// Mock system configuration data
const mockSystemConfig = {
  general: {
    platformName: 'Health Platform',
    supportEmail: 'support@healthplatform.com',
    maxFileSize: '10',
    sessionTimeout: '30',
  },
  features: {
    userRegistration: true,
    labUpload: true,
    actionPlans: true,
    notifications: true,
    analytics: true,
    darkMode: false,
  },
  systems: {
    doula: {
      enabled: true,
      name: 'Doula Care System',
      description: 'Comprehensive doula and fertility care platform',
      primaryColor: '#3B82F6',
    },
    functional_health: {
      enabled: true,
      name: 'Functional Health System',
      description: 'Advanced functional medicine and wellness platform',
      primaryColor: '#8B5CF6',
    },
    elderly_care: {
      enabled: true,
      name: 'Elderly Care System',
      description: 'Specialized care platform for elderly patients',
      primaryColor: '#F59E0B',
    },
  },
}

export default function SettingsPage() {
  const [config, setConfig] = useState(mockSystemConfig)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: 'Settings saved',
        description: 'System configuration has been updated successfully',
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setConfig(mockSystemConfig)
      toast({
        title: 'Settings reset',
        description: 'All settings have been reset to default values',
      })
    }
  }

  const toggleFeature = (feature: string) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature],
      },
    }))
  }

  const toggleSystem = (system: string) => {
    setConfig(prev => ({
      ...prev,
      systems: {
        ...prev.systems,
        [system]: {
          ...prev.systems[system],
          enabled: !prev.systems[system].enabled,
        },
      },
    }))
  }

  const updateGeneralSetting = (key: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [key]: value,
      },
    }))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure platform settings and features</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic platform configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={config.general.platformName}
                  onChange={(e) => updateGeneralSetting('platformName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={config.general.supportEmail}
                  onChange={(e) => updateGeneralSetting('supportEmail', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={config.general.maxFileSize}
                  onChange={(e) => updateGeneralSetting('maxFileSize', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={config.general.sessionTimeout}
                  onChange={(e) => updateGeneralSetting('sessionTimeout', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ToggleRight className="h-5 w-5 mr-2" />
              Feature Flags
            </CardTitle>
            <CardDescription>
              Enable or disable platform features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(config.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {getFeatureDescription(feature)}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFeature(feature)}
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
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              System Configuration
            </CardTitle>
            <CardDescription>
              Configure individual system settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(config.systems).map(([systemKey, system]) => (
                <div key={systemKey} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{system.name}</h4>
                      <p className="text-sm text-gray-500">{system.description}</p>
                    </div>
                    <button
                      onClick={() => toggleSystem(systemKey)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        system.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          system.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {system.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`${systemKey}-name`}>System Name</Label>
                        <Input
                          id={`${systemKey}-name`}
                          value={system.name}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              systems: {
                                ...prev.systems,
                                [systemKey]: {
                                  ...prev.systems[systemKey],
                                  name: e.target.value,
                                },
                              },
                            }))
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${systemKey}-color`}>Primary Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id={`${systemKey}-color`}
                            type="color"
                            value={system.primaryColor}
                            onChange={(e) => {
                              setConfig(prev => ({
                                ...prev,
                                systems: {
                                  ...prev.systems,
                                  [systemKey]: {
                                    ...prev.systems[systemKey],
                                    primaryColor: e.target.value,
                                  },
                                },
                              }))
                            }}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={system.primaryColor}
                            onChange={(e) => {
                              setConfig(prev => ({
                                ...prev,
                                systems: {
                                  ...prev.systems,
                                  [systemKey]: {
                                    ...prev.systems[systemKey],
                                    primaryColor: e.target.value,
                                  },
                                },
                              }))
                            }}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`${systemKey}-description`}>Description</Label>
                        <Input
                          id={`${systemKey}-description`}
                          value={system.description}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              systems: {
                                ...prev.systems,
                                [systemKey]: {
                                  ...prev.systems[systemKey],
                                  description: e.target.value,
                                },
                              },
                            }))
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              System Status
            </CardTitle>
            <CardDescription>
              Current system health and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">API Status</h4>
                  <p className="text-sm text-gray-500">Backend services</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Healthy
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Database</h4>
                  <p className="text-sm text-gray-500">Data storage</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">File Storage</h4>
                  <p className="text-sm text-gray-500">Document storage</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Available
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    userRegistration: 'Allow new users to register accounts',
    labUpload: 'Enable lab result file uploads',
    actionPlans: 'Allow creation and management of action plans',
    notifications: 'Send system notifications to users',
    analytics: 'Collect and display usage analytics',
    darkMode: 'Enable dark mode theme option',
  }
  return descriptions[feature] || 'Feature description not available'
}
