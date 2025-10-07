import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Health Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Start your personalized health journey today
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
