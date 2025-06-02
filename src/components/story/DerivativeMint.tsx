"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers, AlertCircle } from "lucide-react"
import { Address } from "viem"

interface DerivativeMintProps {
  onMint: (parentIpId: Address, metadata: DerivativeMetadata) => void
  onBack: () => void
  parentIpId?: Address
  parentLicenseTermsId?: string | bigint
}

export interface DerivativeMetadata {
  title: string
  description: string
  creator: string
  parentIpId: Address
  ipType?: string
}

export function DerivativeMint({ onMint, onBack, parentIpId: defaultParentIpId, parentLicenseTermsId }: DerivativeMintProps) {
  const [parentIpId, setParentIpId] = useState(defaultParentIpId || "")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [creator, setCreator] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    setError(null)
    
    // Validate parent IP ID
    if (!parentIpId.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError("Invalid IP ID format. Must be a valid Ethereum address.")
      return
    }

    if (!title || !description || !creator) {
      setError("Please fill in all fields")
      return
    }

    const metadata: DerivativeMetadata = {
      title,
      description,
      creator,
      parentIpId: parentIpId as Address,
      ipType: "Derivative"
    }

    onMint(parentIpId as Address, metadata)
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg border-0">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Mint Derivative NFT</CardTitle>
            <CardDescription className="text-gray-600">
              Create a new work based on existing intellectual property
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <AlertCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">About Derivatives</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Derivatives are new works based on existing IPs. You must comply with the parent IP's license terms, including any revenue sharing or attribution requirements. The blockchain automatically enforces these terms.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentIpId" className="text-gray-700 font-semibold">
            Parent IP ID <span className="text-red-500">*</span>
          </Label>
          <Input
            id="parentIpId"
            placeholder="0x..."
            value={parentIpId}
            onChange={(e) => setParentIpId(e.target.value)}
            className="py-2.5 bg-gray-50 border-gray-200 font-mono text-sm focus:bg-white transition-colors"
          />
          <p className="text-xs text-gray-500">
            Enter the blockchain address of the IP you want to create a derivative from
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700 font-semibold">
              Derivative Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="py-2.5 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creator" className="text-gray-700 font-semibold">
              Your Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="creator"
              placeholder="Your name or pseudonym"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              className="py-2.5 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-700 font-semibold">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe your derivative work and how it builds upon the original..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px] bg-gray-50 border-gray-200 focus:bg-white transition-colors resize-none"
            rows={5}
          />
          <p className="text-xs text-gray-500">
            Explain how your work transforms or adds to the original IP
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold">Validation Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Important Information</h4>
          <ul className="text-xs text-gray-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>You must have permission to create derivatives from the parent IP</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>License terms of the parent IP will automatically apply to your derivative</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Revenue sharing will be enforced by smart contracts</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Attribution requirements must be followed as per the license</span>
            </li>
          </ul>
        </div>

        <div className="flex space-x-4 pt-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!parentIpId || !title || !description || !creator}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Mint Derivative NFT
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}