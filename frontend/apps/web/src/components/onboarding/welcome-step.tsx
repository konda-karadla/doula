'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Users, Target, Sparkles } from 'lucide-react'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to Your Health Journey</CardTitle>
          <CardDescription className="text-lg">
            Let's personalize your experience and set you up for success
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              We'll guide you through a few quick steps to create your personalized health profile.
              This will help us provide you with the most relevant insights and recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Profile Setup</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Tell us about yourself</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
              <Target className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900 dark:text-green-100">Journey Selection</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Choose your health goals</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Personalization</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Get tailored insights</p>
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <Button onClick={onNext} size="lg" className="px-8">
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
