'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Zap, Heart, Baby } from 'lucide-react'
import { useOnboardingStore, type JourneyType } from '@/lib/stores/onboarding'

interface JourneyStepProps {
  onNext: () => void
  onPrevious: () => void
}

const journeyOptions = [
  {
    id: 'optimizer' as JourneyType,
    title: 'Health Optimizer',
    description: 'General wellness and health optimization',
    icon: Zap,
    features: [
      'Overall health improvement',
      'Biomarker optimization',
      'Lifestyle enhancement',
      'Preventive care focus'
    ],
    color: 'blue'
  },
  {
    id: 'preconception' as JourneyType,
    title: 'Preconception Care',
    description: 'Preparing for a healthy pregnancy',
    icon: Heart,
    features: [
      'Fertility optimization',
      'Preconception nutrition',
      'Hormone balance',
      'Pregnancy readiness'
    ],
    color: 'pink'
  },
  {
    id: 'fertility_care' as JourneyType,
    title: 'Fertility Care',
    description: 'Advanced fertility support and treatment',
    icon: Baby,
    features: [
      'Advanced fertility testing',
      'Specialized treatment plans',
      'IVF support',
      'Fertility preservation'
    ],
    color: 'green'
  }
]

export function JourneyStep({ onNext, onPrevious }: JourneyStepProps) {
  const { data, setJourneyType } = useOnboardingStore()
  const { journeyType } = data

  const handleJourneySelect = (type: JourneyType) => {
    setJourneyType(type)
  }

  const isNextDisabled = !journeyType

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap = {
      blue: {
        selected: 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20',
        icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-100'
      },
      pink: {
        selected: 'ring-2 ring-pink-500 bg-pink-50 dark:bg-pink-950/20',
        icon: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
        title: 'text-pink-900 dark:text-pink-100'
      },
      green: {
        selected: 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20',
        icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        title: 'text-green-900 dark:text-green-100'
      }
    }
    
    return isSelected ? colorMap[color as keyof typeof colorMap] : {}
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Choose Your Health Journey</CardTitle>
          <CardDescription>
            Select the path that best matches your current health goals and priorities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {journeyOptions.map((journey) => {
              const isSelected = journeyType === journey.id
              const colorClasses = getColorClasses(journey.color, isSelected)
              const IconComponent = journey.icon

              return (
                <Card 
                  key={journey.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected ? colorClasses.selected : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleJourneySelect(journey.id)}
                >
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${colorClasses.icon}`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                      
                      <div>
                        <h3 className={`text-xl font-semibold mb-2 ${isSelected ? colorClasses.title : ''}`}>
                          {journey.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {journey.description}
                        </p>
                      </div>

                      <ul className="text-xs text-muted-foreground space-y-1">
                        {journey.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
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
