"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Wallet, Upload, Eye, BookOpen, AlertCircle, FileText } from "lucide-react"
import { useStoryProtocol } from "@/hooks/useStoryProtocol"
import { uploadAndRegisterIP, IPMetadata } from "@/utils/storyProtocolService"
import { Address } from "viem"

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      isMetaMask?: boolean
      on?: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
    }
  }
}

interface FormData {
  walletAddress: string
  privateKey: string
  file: File | null
  filePreview: string
  title: string
  description: string
  creator: string
}

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    walletAddress: "",
    privateKey: "",
    file: null,
    filePreview: "",
    title: "",
    description: "",
    creator: "",
  })
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null)
  const [uploadResult, setUploadResult] = useState<{
    ipId?: string
    txHash?: string
    error?: string
  } | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [connectionMethod, setConnectionMethod] = useState<"metamask" | "privatekey" | null>(null)
  
  const { connect: connectStoryProtocol, account: storyAccount } = useStoryProtocol()

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const connectWallet = async () => {
    setIsConnecting(true)
    setWalletError(null)
    
    try {
      if (connectionMethod === "metamask") {
        // Check if MetaMask is installed
        if (typeof window === "undefined") {
          throw new Error("Window is not available")
        }

        if (!window.ethereum) {
          throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
        }

        if (!window.ethereum.isMetaMask) {
          throw new Error("Please use MetaMask wallet")
        }

        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        }) as string[]

        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found. Please unlock MetaMask.")
        }

        // Validate the account address
        const account = accounts[0]
        if (!account || typeof account !== 'string') {
          throw new Error("Invalid account address received")
        }

        setFormData((prev) => ({ ...prev, walletAddress: account }))
      } else if (connectionMethod === "privatekey") {
        // Connect using private key for Story Protocol
        if (!formData.privateKey) {
          throw new Error("Please enter your private key")
        }
        
        connectStoryProtocol(formData.privateKey)
        
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (!storyAccount) {
          throw new Error("Failed to connect with private key")
        }
        
        setFormData((prev) => ({ ...prev, walletAddress: storyAccount.address }))
      }
      
      // Add a slight delay for better UX
      setTimeout(() => {
        setCurrentStep(2)
        setIsConnecting(false)
      }, 1500)

    } catch (error) {
      console.error("Error connecting wallet:", error)
      setIsConnecting(false)
      
      // Handle specific MetaMask errors
      const err = error as { code?: number; message?: string }
      if (err.code === 4001) {
        setWalletError("Connection rejected. Please approve the connection request.")
      } else if (err.code === -32002) {
        setWalletError("Connection request is already pending. Please check MetaMask.")
      } else if (err.message) {
        setWalletError(err.message)
      } else {
        setWalletError("Failed to connect wallet. Please try again.")
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }

      // Validate file type - now accepts images, text, and PDF
      const acceptedTypes = ['image/', 'text/plain', 'application/pdf']
      const isValidType = acceptedTypes.some(type => 
        type.includes('/') ? file.type.startsWith(type) : file.type === type
      )
      
      if (!isValidType) {
        alert("Please select a valid file (image, text, or PDF)")
        return
      }

      setFormData((prev) => ({ ...prev, file: file }))
      
      // Preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFormData((prev) => ({ ...prev, filePreview: e.target?.result as string }))
        }
        reader.readAsDataURL(file)
      } else {
        // For text/PDF, just show file name
        setFormData((prev) => ({ ...prev, filePreview: file.name }))
      }
    }
  }

  const handleSubmit = async () => {
    setUploadSuccess(null) // Set to loading state
    setUploadResult(null)
    
    try {
      // If using Story Protocol with private key
      if (connectionMethod === "privatekey" && storyAccount && formData.file) {
        // Prepare metadata
        const metadata: IPMetadata = {
          title: formData.title,
          description: formData.description,
          creator: formData.creator,
          ipType: formData.file.type === "application/pdf" ? "PDF Document" : 
                  formData.file.type === "text/plain" ? "Text Document" : "Image"
        }
        
        // Upload and register IP
        const result = await uploadAndRegisterIP(
          formData.file,
          metadata,
          storyAccount.address as Address
        )
        
        if (result.success) {
          setUploadSuccess(true)
          setUploadResult({
            ipId: result.ipId,
            txHash: result.txHash
          })
        } else {
          setUploadSuccess(false)
          setUploadResult({
            error: result.error
          })
        }
      } else {
        // Original demo behavior for MetaMask
        setTimeout(() => {
          const success = Math.random() > 0.3
          setUploadSuccess(success)
        }, 2000)
      }
      
      setCurrentStep(4)
    } catch (error) {
      console.error("Error submitting:", error)
      setUploadSuccess(false)
      setUploadResult({
        error: error instanceof Error ? error.message : "Unknown error occurred"
      })
      setCurrentStep(4)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setFormData({
      walletAddress: "",
      privateKey: "",
      file: null,
      filePreview: "",
      title: "",
      description: "",
      creator: "",
    })
    setUploadSuccess(null)
    setUploadResult(null)
    setWalletError(null)
    setConnectionMethod(null)
  }

  const disconnectWallet = () => {
    setFormData((prev) => ({ ...prev, walletAddress: "" }))
    setWalletError(null)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iLjAzIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>

      <Card className="w-full max-w-2xl border border-gray-200 shadow-md relative z-10">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-gray-700" />
            <CardTitle className="text-xl font-medium text-gray-900">Web3 Upload Tutorial</CardTitle>
          </div>
          <CardDescription className="text-gray-500">
            Learn how to connect your wallet and upload assets to the blockchain
          </CardDescription>
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-1 bg-gray-100" />
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Step 1: Connect Wallet */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">Connect Your Wallet</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Choose how you want to connect your wallet. You can use MetaMask for general Web3 interactions or a private key for Story Protocol.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Note:</h4>
                <p className="text-xs text-gray-600">
                  MetaMask is great for general Web3 apps, while Story Protocol requires a private key to register IP and mint NFTs. Choose based on your needs.
                </p>
              </div>

              {/* Connection Method Selection */}
              {!connectionMethod && (
                <div className="space-y-3">
                  <Button
                    onClick={() => setConnectionMethod("metamask")}
                    variant="outline"
                    className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect with MetaMask
                  </Button>
                  <Button
                    onClick={() => setConnectionMethod("privatekey")}
                    variant="outline"
                    className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Use Private Key (Story Protocol)
                  </Button>
                </div>
              )}

              {/* Private Key Input */}
              {connectionMethod === "privatekey" && !formData.walletAddress && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="privateKey" className="text-gray-700 font-medium">
                      Private Key
                    </Label>
                    <Input
                      id="privateKey"
                      type="password"
                      placeholder="Enter your private key (without 0x prefix)"
                      value={formData.privateKey}
                      onChange={(e) => setFormData((prev) => ({ ...prev, privateKey: e.target.value }))}
                      className="mt-1 bg-white border-gray-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your private key will be used to sign Story Protocol transactions
                    </p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {walletError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 text-sm font-medium">Connection Failed</p>
                    <p className="text-red-700 text-xs mt-1">{walletError}</p>
                  </div>
                </div>
              )}

              {connectionMethod && !formData.walletAddress && (
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting || (connectionMethod === "privatekey" && !formData.privateKey)}
                  className="w-full bg-black hover:bg-gray-800 text-white disabled:opacity-50"
                >
                  {isConnecting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {connectionMethod === "metamask" ? (
                        <>
                          <Wallet className="h-4 w-4" />
                          <span>Connect MetaMask</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>Connect with Private Key</span>
                        </>
                      )}
                    </div>
                  )}
                </Button>
              )}

              {connectionMethod && (
                <Button
                  onClick={() => {
                    setConnectionMethod(null)
                    setFormData((prev) => ({ ...prev, privateKey: "" }))
                    setWalletError(null)
                  }}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 border-gray-300 hover:bg-gray-100"
                >
                  Change Method
                </Button>
              )}

              {formData.walletAddress && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-800 text-sm font-medium">Wallet Connected</p>
                      <p className="text-green-700 text-xs mt-1 font-mono">
                        {formData.walletAddress.slice(0, 6)}...{formData.walletAddress.slice(-4)}
                      </p>
                    </div>
                    <Button
                      onClick={disconnectWallet}
                      variant="outline"
                      size="sm"
                      className="text-green-700 border-green-300 hover:bg-green-100"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              )}

              {/* Installation Help */}
              {walletError?.includes("not installed") && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Need MetaMask?</h4>
                  <p className="text-xs text-blue-700 mb-3">
                    MetaMask is a browser extension that allows you to interact with Web3 applications.
                  </p>
                  <Button
                    onClick={() => window.open('https://metamask.io/download/', '_blank')}
                    variant="outline"
                    size="sm"
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    Install MetaMask
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Upload File and Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">Upload Your Asset</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  {connectionMethod === "privatekey" 
                    ? "Upload a file (image, text, or PDF) and provide details for Story Protocol IP registration."
                    : "Select an image file and provide a description. This metadata will be stored alongside your asset."}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Note:</h4>
                <p className="text-xs text-gray-600">
                  {connectionMethod === "privatekey"
                    ? "Story Protocol allows you to register any content as intellectual property. Your file will be stored on IPFS and registered as an NFT with licensing terms."
                    : "When uploading to the blockchain, the image is typically stored on IPFS (a decentralized storage system), while metadata like the description is stored directly on-chain."}
                </p>
              </div>

              <div className="space-y-4">
                {connectionMethod === "privatekey" && (
                  <>
                    <div>
                      <Label htmlFor="title" className="text-gray-700 font-medium">
                        Title
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter a title for your IP"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        className="mt-1 bg-white border-gray-200"
                      />
                    </div>

                    <div>
                      <Label htmlFor="creator" className="text-gray-700 font-medium">
                        Creator Name
                      </Label>
                      <Input
                        id="creator"
                        placeholder="Your name or pseudonym"
                        value={formData.creator}
                        onChange={(e) => setFormData((prev) => ({ ...prev, creator: e.target.value }))}
                        className="mt-1 bg-white border-gray-200"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="file" className="text-gray-700 font-medium">
                    Select File {connectionMethod === "privatekey" ? "(Image, Text, or PDF - Max 10MB)" : "(Image - Max 5MB)"}
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept={connectionMethod === "privatekey" ? "image/*,.txt,.pdf" : "image/*"}
                    onChange={handleFileUpload}
                    className="mt-1 bg-white border-gray-200"
                  />
                </div>

                {formData.filePreview && (
                  <div className="relative">
                    {formData.file?.type.startsWith('image/') ? (
                      <div className="relative w-full h-48">
                        <Image
                          src={formData.filePreview}
                          alt="Preview"
                          fill
                          className="object-cover rounded-md border border-gray-200"
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                        <FileText className="h-8 w-8 text-gray-600 mb-2" />
                        <p className="text-sm text-gray-700 font-medium">{formData.filePreview}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.file?.type === "application/pdf" ? "PDF Document" : "Text Document"}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="description" className="text-gray-700 font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={connectionMethod === "privatekey" ? "Describe your intellectual property..." : "Describe your image..."}
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="mt-1 bg-white border-gray-200"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={prevStep}
                  variant="outline"
                  className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Back
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={
                    !formData.file || 
                    !formData.description.trim() ||
                    (connectionMethod === "privatekey" && (!formData.title.trim() || !formData.creator.trim()))
                  }
                  className="flex-1 bg-black hover:bg-gray-800 text-white disabled:opacity-50"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Eye className="h-8 w-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">Review Your Upload</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Verify all information before submitting to the blockchain.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Note:</h4>
                <p className="text-xs text-gray-600">
                  {connectionMethod === "privatekey"
                    ? "Review your IP registration details. Your content will be minted as an NFT with Non-Commercial Social Remixing license terms."
                    : "Always review your transaction details before submitting. Once data is written to the blockchain, it cannot be easily modified or deleted."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <Label className="text-gray-700 font-medium">Wallet Address</Label>
                  <p className="text-gray-600 mt-1 font-mono text-sm break-all">{formData.walletAddress}</p>
                </div>

                {connectionMethod === "privatekey" && (
                  <>
                    <div className="p-3 bg-white rounded-md border border-gray-200">
                      <Label className="text-gray-700 font-medium">Title</Label>
                      <p className="text-gray-600 mt-1">{formData.title}</p>
                    </div>

                    <div className="p-3 bg-white rounded-md border border-gray-200">
                      <Label className="text-gray-700 font-medium">Creator</Label>
                      <p className="text-gray-600 mt-1">{formData.creator}</p>
                    </div>
                  </>
                )}

                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <Label className="text-gray-700 font-medium">File</Label>
                  {formData.filePreview && (
                    formData.file?.type.startsWith('image/') ? (
                      <div className="relative w-full h-32 mt-2">
                        <Image
                          src={formData.filePreview}
                          alt="Upload preview"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <FileText className="h-6 w-6 text-gray-600 mb-1" />
                        <p className="text-sm text-gray-700">{formData.filePreview}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.file?.type === "application/pdf" ? "PDF Document" : "Text Document"}
                        </p>
                      </div>
                    )
                  )}
                </div>

                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <Label className="text-gray-700 font-medium">Description</Label>
                  <p className="text-gray-600 mt-1">{formData.description}</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={prevStep}
                  variant="outline"
                  className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Back
                </Button>
                <Button onClick={handleSubmit} className="flex-1 bg-black hover:bg-gray-800 text-white">
                  Submit Upload
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success/Failure */}
          {currentStep === 4 && (
            <div className="text-center space-y-6">
              {uploadSuccess === null ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                  <h3 className="text-xl font-medium text-gray-900">Processing Upload...</h3>
                  <p className="text-gray-500 text-sm">
                    Your transaction is being processed. This may take a few moments.
                  </p>
                </div>
              ) : uploadSuccess ? (
                <div className="space-y-4">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                  <h3 className="text-xl font-medium text-gray-900">Upload Successful!</h3>
                  <p className="text-gray-500 text-sm">
                    {connectionMethod === "privatekey" 
                      ? "Your content has been successfully registered as intellectual property on Story Protocol"
                      : "Your image has been successfully uploaded to the blockchain"}
                  </p>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Note:</h4>
                    <p className="text-xs text-gray-600">
                      {connectionMethod === "privatekey"
                        ? "Your content has been registered as intellectual property on Story Protocol. The IP ID is your unique identifier for this asset."
                        : "The transaction hash is a unique identifier for your transaction on the blockchain. You can use it to track your transaction on a blockchain explorer."}
                    </p>
                  </div>

                  {connectionMethod === "privatekey" && uploadResult ? (
                    <>
                      {uploadResult.ipId && (
                        <div className="p-3 bg-white border border-gray-200 rounded-md">
                          <p className="text-gray-700 text-sm">
                            <span className="font-medium">IP ID:</span>{" "}
                            <span className="font-mono">{uploadResult.ipId}</span>
                          </p>
                        </div>
                      )}
                      {uploadResult.txHash && (
                        <div className="p-3 bg-white border border-gray-200 rounded-md">
                          <p className="text-gray-700 text-sm">
                            <span className="font-medium">Transaction:</span>{" "}
                            <a
                              href={`https://aeneid.storyscan.io/tx/${uploadResult.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View on Explorer
                            </a>
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-white border border-gray-200 rounded-md">
                      <p className="text-gray-700 text-sm font-mono">Transaction Hash: 0x1234...5678</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <XCircle className="mx-auto h-12 w-12 text-red-600" />
                  <h3 className="text-xl font-medium text-gray-900">Upload Failed</h3>
                  <p className="text-gray-500 text-sm">There was an error processing your upload.</p>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Note:</h4>
                    <p className="text-xs text-gray-600">
                      Blockchain transactions can fail for various reasons including network congestion, insufficient
                      gas fees, or contract errors. Always check error messages for troubleshooting.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-gray-200 rounded-md">
                    <p className="text-gray-700 text-sm">
                      Error: {uploadResult?.error || "Network congestion detected"}
                    </p>
                  </div>
                </div>
              )}

              {uploadSuccess !== null && (
                <Button onClick={resetForm} className="bg-black hover:bg-gray-800 text-white mt-4">
                  Start New Upload
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}