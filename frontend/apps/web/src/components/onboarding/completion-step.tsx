'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Heart } from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboarding'

interface CompletionStepProps {
  onComplete: () => void
}

export function CompletionStep({ onComplete }: CompletionStepProps) {
  const router = useRouter()
  const { data } = useOnboardingStore()

  const handleComplete = () => {
    onComplete()
    router.push('/dashboard')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold">Setup Complete!</CardTitle>
          <CardDescription className="text-lg">
            Your personalized health journey is ready to begin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Congratulations! We&apos;ve successfully set up your health profile with your preferences and goals.
            </p>
          </div>

          {/* Profile Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-center">Your Profile Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profile Type:</span>
                  <span className="font-medium capitalize">
                    {data.profileType === 'individual' ? 'Individual' : 'Couple'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Journey:</span>
                  <span className="font-medium capitalize">
                    {data.journeyType === 'optimizer' && 'Health Optimizer'}
                    {data.journeyType === 'preconception' && 'Preconception Care'}
                    {data.journeyType === 'fertility_care' && 'Fertility Care'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="font-medium uppercase">{data.language}</span>
                </div>
                {data.baselineData.age && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span className="font-medium">{data.baselineData.age} years</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">What&apos;s Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Upload Lab Results</h4>
                <p className="text-xs text-muted-foreground">Get personalized insights</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">View Action Plans</h4>
                <p className="text-xs text-muted-foreground">Start your health journey</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <ArrowRight className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Track Progress</h4>
                <p className="text-xs text-muted-foreground">Monitor your improvements</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <Button onClick={handleComplete} size="lg" className="px-8">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
