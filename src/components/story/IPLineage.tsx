"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  ExternalLink, 
  Copy, 
  FileText, 
  GitBranch, 
  Users, 
  Calendar,
  ArrowRight,
  Crown
} from "lucide-react"
import { useState } from "react"
import { Address } from "viem"

interface IPMetadata {
  title: string
  description: string
  creator: string
  contentUrl?: string
  ipType?: string
  timestamp?: string
}

interface DerivativeIP {
  ipId: Address
  metadata: IPMetadata
  licenseType: string
  licenseTermsId?: string | bigint
  txHash?: string
  createdAt?: string
}

interface IPLineageProps {
  parentIp: {
    ipId: Address
    metadata: IPMetadata
    licenseType: string
    licenseTermsId?: string | bigint
    txHash?: string
  }
  derivatives: DerivativeIP[]
  onMintDerivative: () => void
  onReset: () => void
  onSelectDerivative?: (derivative: DerivativeIP) => void
}

export function IPLineage({ 
  parentIp, 
  derivatives, 
  onMintDerivative, 
  onReset,
  onSelectDerivative 
}: IPLineageProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const getLicenseDisplayName = (type: string) => {
    switch (type) {
      case "non-commercial":
        return "Non-Commercial Social Remixing"
      case "commercial-use":
        return "Commercial Use"
      case "commercial-remix":
        return "Commercial Remix"
      default:
        return type
    }
  }

  const getLicenseBadgeColor = (type: string) => {
    switch (type) {
      case "non-commercial":
        return "bg-green-100 text-green-800 border-green-200"
      case "commercial-use":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "commercial-remix":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return "Unknown"
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Parent IP - Main Card */}
        <div className="lg:col-span-3">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Parent IP Asset
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Original intellectual property registered on Story Protocol
                    </CardDescription>
                  </div>
                </div>
                <Badge className={`${getLicenseBadgeColor(parentIp.licenseType)} border`}>
                  {getLicenseDisplayName(parentIp.licenseType)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Content Preview */}
              {parentIp.metadata.contentUrl && (
                <div className="relative">
                  {parentIp.metadata.ipType === "Image" || parentIp.metadata.contentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <div className="relative w-full h-80 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={parentIp.metadata.contentUrl}
                        alt={parentIp.metadata.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 flex items-center space-x-4">
                      <div className="p-3 bg-white rounded-lg">
                        <FileText className="h-12 w-12 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-medium text-gray-700">{parentIp.metadata.title}</p>
                        <p className="text-sm text-gray-500">{parentIp.metadata.ipType || "Document"}</p>
                      </div>
                      <a
                        href={parentIp.metadata.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 p-2"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{parentIp.metadata.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>by {parentIp.metadata.creator}</span>
                  </div>
                  {parentIp.metadata.timestamp && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(parentIp.metadata.timestamp)}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed">{parentIp.metadata.description}</p>
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">IP ID</p>
                      <p className="text-xs text-gray-600 font-mono mt-1">
                        {parentIp.ipId.slice(0, 12)}...{parentIp.ipId.slice(-10)}
                      </p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(parentIp.ipId, 'ipId')}
                      variant="outline"
                      size="sm"
                      className="text-gray-600"
                    >
                      <Copy className="h-3 w-3" />
                      {copied === 'ipId' ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>

                {parentIp.txHash && (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Transaction</p>
                    <a
                      href={`https://aeneid.storyscan.io/tx/${parentIp.txHash}`}
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

              {/* Actions */}
              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={onMintDerivative}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Create Derivative
                </Button>
                <Button
                  onClick={onReset}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Register New IP
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Derivatives Sidebar */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0 h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <GitBranch className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Lineage</CardTitle>
              </div>
              <CardDescription>
                Derivatives created from this IP
              </CardDescription>
            </CardHeader>

            <CardContent>
              {derivatives.length === 0 ? (
                <div className="text-center py-8">
                  <GitBranch className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-2">No derivatives yet</p>
                  <p className="text-xs text-gray-400">
                    Be the first to create a derivative from this IP
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {derivatives.map((derivative, index) => (
                    <div
                      key={derivative.ipId}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => onSelectDerivative?.(derivative)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {derivative.metadata.title}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            by {derivative.metadata.creator}
                          </p>
                        </div>
                        <ArrowRight className="h-3 w-3 text-gray-400 mt-1 ml-2 flex-shrink-0" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getLicenseBadgeColor(derivative.licenseType)} border-0`}
                        >
                          {derivative.licenseType}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 font-mono truncate">
                          {derivative.ipId.slice(0, 8)}...{derivative.ipId.slice(-6)}
                        </p>
                        {derivative.createdAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(derivative.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {derivatives.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Total Derivatives</span>
                    <span className="font-medium">{derivatives.length}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}