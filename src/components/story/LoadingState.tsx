"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LoadingStateProps {
  title: string
  description: string
}

export function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <Card className="w-full max-w-2xl shadow-lg border-0 mx-auto">
      <CardHeader className="space-y-1 pb-8 pt-8">
        <div className="text-center space-y-3">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-600 text-base max-w-md mx-auto">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-20 space-y-10">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-gray-100 rounded-full"></div>
          <div className="w-24 h-24 border-4 border-transparent border-t-purple-600 border-r-pink-600 rounded-full animate-spin absolute top-0 left-0"></div>
          <div className="w-16 h-16 border-4 border-transparent border-b-purple-400 border-l-pink-400 rounded-full animate-spin absolute top-4 left-4" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
        
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Processing blockchain transaction</p>
        </div>

        <div className="w-full max-w-md px-8">
          <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 h-full rounded-full animate-pulse relative" style={{ width: '70%' }}>
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between mt-3 text-xs text-gray-500">
            <span>Uploading to IPFS</span>
            <span>Registering on-chain</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 max-w-md">
          <p className="text-sm text-gray-700 text-center leading-relaxed">
            <span className="font-semibold">🔒 Secure Transaction</span><br />
            Your transaction is being processed on the Story Protocol blockchain. This ensures permanent and tamper-proof registration of your intellectual property.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}