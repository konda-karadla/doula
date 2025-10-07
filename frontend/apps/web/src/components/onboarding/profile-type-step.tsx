'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Users, ArrowLeft, ArrowRight } from 'lucide-react'
import { useOnboardingStore, type ProfileType } from '@/lib/stores/onboarding'

interface ProfileTypeStepProps {
  onNext: () => void
  onPrevious: () => void
}

export function ProfileTypeStep({ onNext, onPrevious }: ProfileTypeStepProps) {
  const { data, setProfileType } = useOnboardingStore()
  const { profileType } = data

  const handleProfileTypeSelect = (type: ProfileType) => {
    setProfileType(type)
  }

  const isNextDisabled = !profileType

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Choose Your Profile Type</CardTitle>
          <CardDescription>
            This helps us personalize your health journey and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                profileType === 'individual' 
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => handleProfileTypeSelect('individual')}
            >
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Individual</h3>
                <p className="text-sm text-muted-foreground">
                  Personal health optimization and wellness journey
                </p>
                <ul className="text-xs text-muted-foreground mt-3 space-y-1">
                  <li>• Personal health metrics</li>
                  <li>• Individual wellness goals</li>
                  <li>• Solo accountability tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                profileType === 'couple' 
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => handleProfileTypeSelect('couple')}
            >
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Couple</h3>
                <p className="text-sm text-muted-foreground">
                  Shared health journey for partners planning together
                </p>
                <ul className="text-xs text-muted-foreground mt-3 space-y-1">
                  <li>• Joint health tracking</li>
                  <li>• Shared wellness goals</li>
                  <li>• Partner accountability</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onPrevious}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={onNext} 
              disabled={isNextDisabled}
              className="ml-auto"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
