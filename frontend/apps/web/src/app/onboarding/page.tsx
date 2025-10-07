'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/lib/stores/onboarding'
import { useAuthStore } from '@/lib/stores/auth'
import { WelcomeStep } from '@/components/onboarding/welcome-step'
import { ProfileTypeStep } from '@/components/onboarding/profile-type-step'
import { JourneyStep } from '@/components/onboarding/journey-step'
import { BaselineDataStep } from '@/components/onboarding/baseline-data-step'
import { CompletionStep } from '@/components/onboarding/completion-step'

const steps = [
  'welcome',
  'profile-type',
  'journey',
  'baseline-data',
  'completion'
] as const

export default function OnboardingPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { currentStep, nextStep, previousStep, completeOnboarding, isCompleted } = useOnboardingStore()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Redirect if onboarding is already completed
  useEffect(() => {
    if (isCompleted) {
      router.push('/dashboard')
    }
  }, [isCompleted, router])

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const currentStepName = steps[currentStep]

  const renderStep = () => {
    switch (currentStepName) {
      case 'welcome':
        return <WelcomeStep onNext={nextStep} />
      
      case 'profile-type':
        return <ProfileTypeStep onNext={nextStep} onPrevious={previousStep} />
      
      case 'journey':
        return <JourneyStep onNext={nextStep} onPrevious={previousStep} />
      
      case 'baseline-data':
        return <BaselineDataStep onNext={nextStep} onPrevious={previousStep} />
      
      case 'completion':
        return <CompletionStep onComplete={completeOnboarding} />
      
      default:
        return <WelcomeStep onNext={nextStep} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Health Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Let's set up your personalized health journey
          </p>
        </div>

        {/* Progress Bar */}
        {currentStepName !== 'welcome' && currentStepName !== 'completion' && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {steps.slice(1, -1).map((_, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index < currentStep - 1
                        ? 'bg-blue-500 text-white'
                        : index === currentStep - 1
                        ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length - 2}
              </span>
            </div>
          </div>
        )}

        {/* Step Content */}
        {renderStep()}
      </div>
    </div>
  )
}
