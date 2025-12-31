//src\components\shared\network-status.tsx
'use client'

import { useEffect, useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm">No internet connection</span>
    </div>
  )
}