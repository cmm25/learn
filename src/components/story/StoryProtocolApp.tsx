"use client"

import { useState, useCallback } from "react"
import { WalletConnect } from "./WalletConnect"
import { IPUpload } from "./IPUpload"
import { IPDisplay } from "./IPDisplay"
import { IPLineage } from "./IPLineage"
import { DerivativeMint } from "./DerivativeMint"
import { LoadingState } from "./LoadingState"
import { ErrorDisplay } from "./ErrorDisplay"
import { 
  uploadAndRegisterIP, 
  mintDerivativeNFT, 
  getIPMetadata,
  IPMetadata, 
  LicenseOptions 
} from "@/utils/storyProtocolService"
import { DerivativeMetadata } from "./DerivativeMint"
import { Address } from "viem"

type AppState = 
  | "wallet-connect"
  | "ip-upload"
  | "ip-display"
  | "ip-lineage"
  | "derivative-mint"
  | "loading"
  | "error"

interface DerivativeIP {
  ipId: Address
  metadata: IPMetadata
  licenseType: string
  licenseTermsId?: string | bigint
  txHash?: string
  createdAt?: string
}

interface AppData {
  walletAddress?: string
  pinataApiKey?: string
  ipId?: Address
  txHash?: string
  metadata?: IPMetadata
  licenseType?: string
  licenseTermsId?: string | bigint
  derivatives?: DerivativeIP[]
  parentIpId?: Address
  error?: string
  loadingTitle?: string
  loadingDescription?: string
}

export function StoryProtocolApp() {
  const [appState, setAppState] = useState<AppState>("wallet-connect")
  const [appData, setAppData] = useState<AppData>({ derivatives: [] })

  const handleWalletConnect = useCallback((walletAddress: string, pinataApiKey: string) => {
    setAppData({ walletAddress, pinataApiKey })
    setAppState("ip-upload")
  }, [])

  const handleIPUpload = async (file: File, metadata: IPMetadata, licenseOptions: LicenseOptions) => {
    if (!appData.walletAddress) return

    setAppState("loading")
    setAppData(prev => ({
      ...prev,
      loadingTitle: "Registering IP",
      loadingDescription: "Uploading to IPFS and registering on Story Protocol..."
    }))

    const result = await uploadAndRegisterIP(
      file,
      metadata,
      appData.walletAddress as Address,
      appData.pinataApiKey,
      licenseOptions
    )

    if (result.success && result.ipId) {
      // Fetch the metadata to display
      const ipMetadata = await getIPMetadata(result.ipId, appData.pinataApiKey)
      
      setAppData(prev => ({
        ...prev,
        ipId: result.ipId,
        txHash: result.txHash,
        metadata: ipMetadata || metadata,
        licenseType: licenseOptions.type,
        licenseTermsId: result.licenseTermsId
      }))
      setAppState("ip-display")
    } else {
      setAppData(prev => ({
        ...prev,
        error: result.error || "Failed to register IP"
      }))
      setAppState("error")
    }
  }

  const handleDerivativeMint = async (parentIpId: Address, metadata: DerivativeMetadata) => {
    if (!appData.walletAddress) return

    setAppState("loading")
    setAppData(prev => ({
      ...prev,
      loadingTitle: "Minting Derivative",
      loadingDescription: "Creating derivative NFT from parent IP..."
    }))

    const result = await mintDerivativeNFT(
      parentIpId,
      metadata,
      appData.walletAddress as Address,
      appData.pinataApiKey,
      appData.licenseTermsId
    )

    if (result.success && result.childIpId) {
      // Fetch the metadata to display
      const ipMetadata = await getIPMetadata(result.childIpId)
      
      // Create the new derivative
      const newDerivative: DerivativeIP = {
        ipId: result.childIpId,
        metadata: ipMetadata || { ...metadata, ipType: metadata.ipType || "Derivative" },
        licenseType: "derivative",
        licenseTermsId: appData.licenseTermsId,
        txHash: result.txHash,
        createdAt: new Date().toISOString()
      }

      // Add to derivatives list and show lineage view
      setAppData(prev => ({
        ...prev,
        derivatives: [...(prev.derivatives || []), newDerivative],
        parentIpId: parentIpId
      }))
      setAppState("ip-lineage")
    } else {
      setAppData(prev => ({
        ...prev,
        error: result.error || "Failed to mint derivative"
      }))
      setAppState("error")
    }
  }

  const handleSelectDerivative = (derivative: DerivativeIP) => {
    setAppData(prev => ({
      ...prev,
      ipId: derivative.ipId,
      txHash: derivative.txHash,
      metadata: derivative.metadata,
      licenseType: derivative.licenseType,
      licenseTermsId: derivative.licenseTermsId
    }))
    setAppState("ip-display")
  }

  const handleViewLineage = () => {
    setAppState("ip-lineage")
  }

  const handleReset = () => {
    setAppData({})
    setAppState("wallet-connect")
  }

  const handleBack = () => {
    switch (appState) {
      case "ip-upload":
        setAppState("wallet-connect")
        break
      case "derivative-mint":
        // Go back to lineage if we have derivatives, otherwise to display
        if (appData.derivatives && appData.derivatives.length > 0) {
          setAppState("ip-lineage")
        } else {
          setAppState("ip-display")
        }
        break
      case "ip-lineage":
        setAppState("ip-display")
        break
      default:
        break
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iLjAzIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
      
      <div className="relative z-10 w-full flex justify-center">
        {appState === "wallet-connect" && (
          <WalletConnect onConnect={handleWalletConnect} />
        )}
        
        {appState === "ip-upload" && (
          <IPUpload 
            onSubmit={handleIPUpload} 
            onBack={handleBack}
          />
        )}
        
        {appState === "ip-display" && appData.ipId && (
          <IPDisplay
            ipId={appData.ipId}
            txHash={appData.txHash}
            metadata={appData.metadata}
            licenseType={appData.licenseType || "non-commercial"}
            licenseTermsId={appData.licenseTermsId}
            onMintDerivative={() => setAppState("derivative-mint")}
            onViewLineage={appData.derivatives && appData.derivatives.length > 0 ? handleViewLineage : undefined}
            onReset={handleReset}
          />
        )}

        {appState === "ip-lineage" && appData.ipId && appData.metadata && (
          <IPLineage
            parentIp={{
              ipId: appData.parentIpId || appData.ipId,
              metadata: appData.metadata,
              licenseType: appData.licenseType || "non-commercial",
              licenseTermsId: appData.licenseTermsId,
              txHash: appData.txHash
            }}
            derivatives={appData.derivatives || []}
            onMintDerivative={() => setAppState("derivative-mint")}
            onSelectDerivative={handleSelectDerivative}
            onReset={handleReset}
          />
        )}
        
        {appState === "derivative-mint" && (
          <DerivativeMint
            onMint={handleDerivativeMint}
            onBack={handleBack}
            parentIpId={appData.ipId}
            parentLicenseTermsId={appData.licenseTermsId}
          />
        )}
        
        {appState === "loading" && (
          <LoadingState
            title={appData.loadingTitle || "Processing..."}
            description={appData.loadingDescription || "Please wait while we process your request"}
          />
        )}
        
        {appState === "error" && (
          <ErrorDisplay
            title="Operation Failed"
            error={appData.error || "An unknown error occurred"}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}