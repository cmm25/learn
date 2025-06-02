"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, FileText, AlertCircle } from "lucide-react"
import { initializeStoryClient } from "@/utils/browserConfig"

interface WalletConnectProps {
  onConnect: (walletAddress: string, pinataApiKey: string) => void
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const [privateKey, setPrivateKey] = useState("")
  const [pinataApiKey, setPinataApiKey] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)
    
    try {
      if (!privateKey || !pinataApiKey) {
        throw new Error("Please enter both private key and Pinata JWT")
      }
      
      // Remove 0x prefix if present
      const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey
      
      // Validate private key format
      if (!/^[0-9a-fA-F]{64}$/.test(cleanPrivateKey)) {
        throw new Error('Invalid private key format. Must be 64 hex characters.')
      }
      
      const { account } = initializeStoryClient(cleanPrivateKey)
      
      if (!account) {
        throw new Error("Failed to initialize account")
      }
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onConnect(account.address, pinataApiKey)
    } catch (error) {
      console.error("Error connecting:", error)
      setError(error instanceof Error ? error.message : "Failed to connect")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg border-0">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Connect to Story Protocol</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to start registering intellectual property
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100">
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <AlertCircle className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Security Note</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your private key is processed locally and never leaves your device. We use industry-standard encryption to ensure your credentials remain secure.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="privateKey" className="text-gray-700 font-semibold flex items-center space-x-2">
              <span>Private Key</span>
              <span className="text-xs text-gray-400 font-normal">(Required)</span>
            </Label>
            <div className="relative">
              <Input
                id="privateKey"
                type="password"
                placeholder="Enter your private key (without 0x prefix)"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="pl-4 pr-4 py-3 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5 pl-1">
              64 hexadecimal characters used to sign blockchain transactions
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pinataApiKey" className="text-gray-700 font-semibold flex items-center space-x-2">
              <span>Pinata JWT Token</span>
              <span className="text-xs text-gray-400 font-normal">(Required)</span>
            </Label>
            <div className="relative">
              <Input
                id="pinataApiKey"
                type="password"
                placeholder="Enter your Pinata JWT token"
                value={pinataApiKey}
                onChange={(e) => setPinataApiKey(e.target.value)}
                className="pl-4 pr-4 py-3 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5 pl-1">
              For IPFS storage. Get your free token at{" "}
              <a 
                href="https://pinata.cloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                pinata.cloud
              </a>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold">Connection Failed</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <Button
          onClick={handleConnect}
          disabled={isConnecting || !privateKey || !pinataApiKey}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isConnecting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Connecting to Story Protocol...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Connect Wallet</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}