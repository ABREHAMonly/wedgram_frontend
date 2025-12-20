//src\app\error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
          <p className="text-gray-600 mb-6">
            We apologize for the inconvenience. Please try again or contact support if the problem persists.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-mono text-sm">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            className="flex items-center justify-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Error Code: {error.digest || 'N/A'}</p>
          <p className="mt-2">If this continues, please contact support@wedgram.com</p>
        </div>
      </div>
    </div>
  )
}