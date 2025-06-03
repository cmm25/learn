"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink, Copy, FileText } from "lucide-react"
import { useState } from "react"
import { Address } from "viem"

interface IPDisplayProps {
  ipId: Address
  txHash?: string
  metadata?: {
    title: string
    description: string
    creator: string
    contentUrl?: string
    ipType?: string
  }
  licenseType: string
  licenseTermsId?: string | bigint
  onMintDerivative: () => void
  onViewLineage?: () => void
  onReset: () => void
}

export function IPDisplay({ 
  ipId, 
  txHash, 
  metadata, 
  licenseType,
  licenseTermsId,
  onMintDerivative,
  onViewLineage,
  onReset 
}: IPDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getLicenseDisplayName = (type: string) => {
    switch (type) {
      case "non-commercial":
        return "Non-Commercial Social Remixing"
      case "commercial-use":
        return "Commercial Use"
      case "commercial-remix":
        return "Commercial Remix"
      case "cc-attribution":
        return "Creative Commons Attribution"
      default:
        return type
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <CardTitle>IP Successfully Registered!</CardTitle>
        </div>
        <CardDescription>
          Your content has been registered as intellectual property on Story Protocol
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {metadata && (
          <>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-2">{metadata.title}</h3>
              <p className="text-sm text-gray-600 mb-2">by {metadata.creator}</p>
              <p className="text-sm text-gray-700">{metadata.description}</p>
            </div>

            {metadata.contentUrl && (
              <div className="relative">
                {metadata.ipType === "Image" || metadata.contentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <div className="relative w-full h-64">
                    <Image
                      src={metadata.contentUrl}
                      alt={metadata.title}
                      fill
                      className="object-cover rounded-md border border-gray-200"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200 flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{metadata.title}</p>
                      <p className="text-xs text-gray-500">{metadata.ipType || "Document"}</p>
                    </div>
                    <a
                      href={metadata.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="space-y-3">
          <div className="p-3 bg-white border border-gray-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">IP ID</p>
                <p className="text-xs text-gray-600 font-mono mt-1">
                  {ipId.slice(0, 10)}...{ipId.slice(-8)}
                </p>
              </div>
              <Button
                onClick={() => copyToClipboard(ipId)}
                variant="outline"
                size="sm"
                className="text-gray-600"
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-white border border-gray-200 rounded-md">
              <p className="text-sm font-medium text-gray-700">License Type</p>
              <p className="text-xs text-gray-600 mt-1">
                {getLicenseDisplayName(licenseType)}
                {licenseTermsId && (
                  <span className="text-gray-400 ml-2">(ID: {licenseTermsId.toString()})</span>
                )}
              </p>
            </div>

          {txHash && (
            <div className="p-3 bg-white border border-gray-200 rounded-md">
              <p className="text-sm font-medium text-gray-700">Transaction</p>
              <a
                href={`https://aeneid.storyscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center space-x-1 mt-1"
              >
                <span>View on Explorer</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">What's Next?</h4>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>Your IP is now protected on the blockchain</li>
            <li>Others can request licenses based on your terms</li>
            <li>You can mint derivatives of other IPs</li>
            <li>Track usage and collect royalties automatically</li>
          </ul>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={onMintDerivative}
            variant="outline"
            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Mint Derivative
          </Button>
          {onViewLineage && (
            <Button
              onClick={onViewLineage}
              variant="outline"
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              View Lineage
            </Button>
          )}
          <Button
            onClick={onReset}
            className="flex-1 bg-black hover:bg-gray-800 text-white"
          >
            Register New IP
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}