"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorDisplayProps {
  title: string
  error: string
  onRetry?: () => void
  onReset: () => void
}

export function ErrorDisplay({ title, error, onRetry, onReset }: ErrorDisplayProps) {
  return (
    <Card className="w-full max-w-2xl shadow-lg border-0">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg">
            <XCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
            <CardDescription className="text-gray-600">
              Something went wrong while processing your request
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-5 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold mb-1">Error Details</p>
              <p className="text-red-700 text-sm break-words">{error}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-5 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Troubleshooting Tips
          </h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              <span>Check your network connection and try again</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              <span>Ensure you have sufficient ETH for gas fees</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              <span>Verify your private key and Pinata JWT are correct</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              <span>For derivatives, ensure the parent IP exists and has proper license terms</span>
            </li>
          </ul>
        </div>
        
        <div className="flex space-x-4 pt-4">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button
            onClick={onReset}
            className="flex-1 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Home className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}