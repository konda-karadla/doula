'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboarding'

const baselineSchema = z.object({
  age: z.number().min(18).max(100),
  gender: z.string().min(1),
  height: z.number().min(120).max(220), // cm
  weight: z.number().min(30).max(200), // kg
  exerciseFrequency: z.string().min(1),
  dietType: z.string().min(1),
  sleepHours: z.number().min(4).max(12),
  stressLevel: z.string().min(1),
})

type BaselineFormData = z.infer<typeof baselineSchema>

interface BaselineDataStepProps {
  onNext: () => void
  onPrevious: () => void
}

export function BaselineDataStep({ onNext, onPrevious }: BaselineDataStepProps) {
  const { data, updateBaselineData } = useOnboardingStore()
  const [currentSection, setCurrentSection] = useState<'basic' | 'lifestyle'>('basic')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BaselineFormData>({
    resolver: zodResolver(baselineSchema),
    defaultValues: {
      age: data.baselineData.age || undefined,
      gender: data.baselineData.gender || '',
      height: data.baselineData.height || undefined,
      weight: data.baselineData.weight || undefined,
      exerciseFrequency: data.baselineData.lifestyle?.exerciseFrequency || '',
      dietType: data.baselineData.lifestyle?.dietType || '',
      sleepHours: data.baselineData.lifestyle?.sleepHours || undefined,
      stressLevel: data.baselineData.lifestyle?.stressLevel || '',
    }
  })

  const onSubmit = (formData: BaselineFormData) => {
    updateBaselineData({
      age: formData.age,
      gender: formData.gender,
      height: formData.height,
      weight: formData.weight,
      lifestyle: {
        exerciseFrequency: formData.exerciseFrequency,
        dietType: formData.dietType,
        sleepHours: formData.sleepHours,
        stressLevel: formData.stressLevel,
      }
    })
    onNext()
  }

  const handleNextSection = () => {
    if (currentSection === 'basic') {
      setCurrentSection('lifestyle')
    } else {
      handleSubmit(onSubmit)()
    }
  }

  const handlePreviousSection = () => {
    if (currentSection === 'lifestyle') {
      setCurrentSection('basic')
    } else {
      onPrevious()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Tell Us About Yourself</CardTitle>
          <CardDescription>
            Help us understand your current health status and lifestyle
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              <div className={`w-3 h-3 rounded-full ${currentSection === 'basic' ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <div className={`w-3 h-3 rounded-full ${currentSection === 'lifestyle' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {currentSection === 'basic' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      {...register('age', { valueAsNumber: true })}
                    />
                    {errors.age && (
                      <p className="text-sm text-destructive">{errors.age.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...register('gender')}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    {errors.gender && (
                      <p className="text-sm text-destructive">{errors.gender.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      {...register('height', { valueAsNumber: true })}
                    />
                    {errors.height && (
                      <p className="text-sm text-destructive">{errors.height.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      {...register('weight', { valueAsNumber: true })}
                    />
                    {errors.weight && (
                      <p className="text-sm text-destructive">{errors.weight.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentSection === 'lifestyle' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lifestyle Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="exerciseFrequency">Exercise Frequency</Label>
                  <select
                    id="exerciseFrequency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register('exerciseFrequency')}
                  >
                    <option value="">Select frequency</option>
                    <option value="none">No exercise</option>
                    <option value="light">1-2 times per week</option>
                    <option value="moderate">3-4 times per week</option>
                    <option value="active">5-6 times per week</option>
                    <option value="very-active">Daily exercise</option>
                  </select>
                  {errors.exerciseFrequency && (
                    <p className="text-sm text-destructive">{errors.exerciseFrequency.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietType">Diet Type</Label>
                  <select
                    id="dietType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register('dietType')}
                  >
                    <option value="">Select diet</option>
                    <option value="standard">Standard</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Keto</option>
                    <option value="paleo">Paleo</option>
                    <option value="mediterranean">Mediterranean</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.dietType && (
                    <p className="text-sm text-destructive">{errors.dietType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sleepHours">Sleep Hours (per night)</Label>
                  <Input
                    id="sleepHours"
                    type="number"
                    placeholder="8"
                    {...register('sleepHours', { valueAsNumber: true })}
                  />
                  {errors.sleepHours && (
                    <p className="text-sm text-destructive">{errors.sleepHours.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stressLevel">Stress Level</Label>
                  <select
                    id="stressLevel"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register('stressLevel')}
                  >
                    <option value="">Select stress level</option>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="very-high">Very High</option>
                  </select>
                  {errors.stressLevel && (
                    <p className="text-sm text-destructive">{errors.stressLevel.message}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handlePreviousSection}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNextSection} type="button">
                {currentSection === 'basic' ? 'Continue' : 'Complete Setup'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
