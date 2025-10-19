import { create } from 'zustand'

export type ProfileType = 'individual' | 'couple'
export type JourneyType = 'optimizer' | 'preconception' | 'fertility_care'
export type Language = 'en' | 'es' | 'fr' | 'de'

export interface OnboardingData {
  profileType: ProfileType | null
  journeyType: JourneyType | null
  language: Language
  baselineData: {
    age?: number
    gender?: string
    height?: number
    weight?: number
    medicalHistory?: string[]
    currentMedications?: string[]
    allergies?: string[]
    lifestyle?: {
      exerciseFrequency?: string
      dietType?: string
      sleepHours?: number
      stressLevel?: string
    }
  }
}

interface OnboardingState {
  currentStep: number
  isCompleted: boolean
  data: OnboardingData
}

interface OnboardingActions {
  setProfileType: (type: ProfileType) => void
  setJourneyType: (type: JourneyType) => void
  setLanguage: (language: Language) => void
  updateBaselineData: (data: Partial<OnboardingData['baselineData']>) => void
  nextStep: () => void
  previousStep: () => void
  completeOnboarding: () => void
  resetOnboarding: () => void
}

const initialData: OnboardingData = {
  profileType: null,
  journeyType: null,
  language: 'en',
  baselineData: {}
}

export const useOnboardingStore = create<OnboardingState & OnboardingActions>((set) => ({
  // Initial state
  currentStep: 0,
  isCompleted: false,
  data: initialData,

  // Actions
  setProfileType: (type: ProfileType) => {
    set((state) => ({
      data: { ...state.data, profileType: type }
    }))
  },

  setJourneyType: (type: JourneyType) => {
    set((state) => ({
      data: { ...state.data, journeyType: type }
    }))
  },

  setLanguage: (language: Language) => {
    set((state) => ({
      data: { ...state.data, language }
    }))
  },

  updateBaselineData: (newData) => {
    set((state) => ({
      data: {
        ...state.data,
        baselineData: { ...state.data.baselineData, ...newData }
      }
    }))
  },

  nextStep: () => {
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 4) // Max 5 steps (0-4)
    }))
  },

  previousStep: () => {
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0)
    }))
  },

  completeOnboarding: () => {
    set({ isCompleted: true })
  },

  resetOnboarding: () => {
    set({
      currentStep: 0,
      isCompleted: false,
      data: initialData
    })
  }
}))
