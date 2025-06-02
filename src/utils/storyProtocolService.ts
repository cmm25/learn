"use client"

import { getStoryClient } from './browserConfig'
import { uploadFileToIPFS, uploadJSONToIPFS } from './functions/uploadIPFS'
import { SPGNFTContractAddress, NonCommercialSocialRemixingTermsId, createCommercialRemixTerms, PILTemplateAddress } from './utils'
import { Address, keccak256, toHex, zeroAddress } from 'viem'

export interface IPMetadata {
    title: string
    description: string
    ipType: string
    creator: string
    contentHash?: string
    contentUrl?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}

export interface RegisterIPResult {
    success: boolean
    ipId?: Address
    tokenId?: bigint
    licenseTermsId?: bigint
    txHash?: string
    error?: string
}

export interface LicenseOptions {
    type: 'non-commercial' | 'commercial-use' | 'commercial-remix' | 'cc-attribution'
    commercialRevShare?: number
    defaultMintingFee?: number
}

export interface DerivativeMetadata {
    title: string
    description: string
    creator: string
    parentIpId: Address
    ipType?: string
}

export interface MintDerivativeResult {
    success: boolean
    childIpId?: Address
    tokenId?: bigint
    txHash?: string
    error?: string
}

/**
 * Upload content and register as IP with Story Protocol
 * @param file - The file to upload (text or PDF)
 * @param metadata - Metadata for the IP
 * @param recipientAddress - Address to receive the minted NFT
 * @returns Result of the registration
 */
export async function uploadAndRegisterIP(
    file: File,
    metadata: IPMetadata,
    recipientAddress: Address,
    pinataApiKey?: string,
    licenseOptions?: LicenseOptions
): Promise<RegisterIPResult> {
    try {
        const client = getStoryClient()
        
        // Step 1: Upload file to IPFS
        console.log('Uploading file to IPFS...')
        const fileHash = await uploadFileToIPFS(file, pinataApiKey)
        const fileUrl = `https://gateway.pinata.cloud/ipfs/${fileHash}`
        
        // Step 2: Create and upload metadata to IPFS
        const fullMetadata = {
            ...metadata,
            contentHash: fileHash,
            contentUrl: fileUrl,
            timestamp: new Date().toISOString(),
            fileType: file.type,
            fileName: file.name
        }
        
        console.log('Uploading metadata to IPFS...')
        const metadataHash = await uploadJSONToIPFS({...fullMetadata}, pinataApiKey)
        const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataHash}`
        
        // Convert IPFS hash to bytes32 format
        const metadataHashBytes32 = keccak256(toHex(metadataHash))
        
        // Step 3: Mint and register IP using SPG
        console.log('Minting and registering IP...')
        console.log('SPG NFT Contract:', SPGNFTContractAddress)
        console.log('Recipient:', recipientAddress)
        console.log('PIL Type:', NonCommercialSocialRemixingTermsId)
        console.log('Metadata Hash (original):', metadataHash)
        console.log('Metadata Hash (bytes32):', metadataHashBytes32)
        
        // Validate SPG NFT Contract Address
        if (!SPGNFTContractAddress || SPGNFTContractAddress === '0x0000000000000000000000000000000000000000') {
            throw new Error('SPG NFT Contract Address is not configured')
        }
        
        // Determine license terms based on options
        let licenseTermsId: string | bigint = NonCommercialSocialRemixingTermsId
        
        if (licenseOptions) {
            switch (licenseOptions.type) {
                case 'non-commercial':
                    licenseTermsId = NonCommercialSocialRemixingTermsId
                    break
                case 'commercial-use':
                    // For commercial use, we'll use the default non-commercial terms
                    // since commercial use without derivatives requires special setup
                    licenseTermsId = NonCommercialSocialRemixingTermsId
                    console.log('Using default license terms for commercial use:', licenseTermsId)
                    break
                case 'commercial-remix':
                    // Use pre-existing commercial remix license terms
                    // ID 3 is typically the commercial remix license on Story Protocol
                    licenseTermsId = '3'
                    console.log('Using commercial remix license terms:', licenseTermsId)
                    break
                case 'cc-attribution':
                    // Use non-commercial terms for CC attribution
                    // Since it allows derivatives and remixing
                    licenseTermsId = NonCommercialSocialRemixingTermsId
                    console.log('Using non-commercial terms for CC attribution:', licenseTermsId)
                    break
            }
        }
        
        // First mint and register the IP
        console.log('Minting and registering IP...')
        const mintResult = await client.ipAsset.mintAndRegisterIp({
            spgNftContract: SPGNFTContractAddress,
            recipient: recipientAddress,
            ipMetadata: {
                ipMetadataURI: metadataUrl,
                ipMetadataHash: metadataHashBytes32,
                nftMetadataURI: metadataUrl,
                nftMetadataHash: metadataHashBytes32
            },
            txOptions: {
                waitForTransaction: true
            }
        })
        
        console.log('IP minted and registered:', mintResult)
        
        // Now attach the PIL terms using the correct method
        console.log('Attaching PIL terms:', licenseTermsId)
        try {
            const attachResult = await client.license.attachLicenseTerms({
                ipId: mintResult.ipId as Address,
                licenseTermsId: licenseTermsId,
                licenseTemplate: PILTemplateAddress,
                txOptions: {
                    waitForTransaction: true
                }
            })
            console.log('PIL terms attached:', attachResult)
        } catch (attachError) {
            console.error('Failed to attach PIL terms:', attachError)
            // Continue anyway as we have a valid IP
        }
        
        return {
            success: true,
            ipId: mintResult.ipId as Address,
            tokenId: mintResult.tokenId,
            licenseTermsId: typeof licenseTermsId === 'string' ? BigInt(licenseTermsId) : licenseTermsId,
            txHash: mintResult.txHash
        }
    } catch (error) {
        console.error('Error registering IP:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }
}

/**
 * Mint a derivative NFT from a parent IP
 * @param parentIpId - The parent IP ID to create derivative from
 * @param metadata - Metadata for the derivative
 * @param recipientAddress - Address to receive the minted derivative NFT
 * @param pinataApiKey - Pinata API key for IPFS upload
 * @param parentLicenseTermsId - Optional license terms ID of the parent (will try to detect if not provided)
 * @returns Result of the derivative minting
 */
export async function mintDerivativeNFT(
    parentIpId: Address,
    metadata: DerivativeMetadata,
    recipientAddress: Address,
    pinataApiKey?: string,
    parentLicenseTermsId?: string | bigint
): Promise<MintDerivativeResult> {
    try {
        const client = getStoryClient()
        
        // Step 1: Upload metadata to IPFS
        const fullMetadata = {
            ...metadata,
            timestamp: new Date().toISOString(),
            type: 'derivative',
            parentIpId
        }
        
        console.log('Uploading derivative metadata to IPFS...')
        const metadataHash = await uploadJSONToIPFS(fullMetadata, pinataApiKey)
        const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataHash}`
        
        // Convert IPFS hash to bytes32 format
        const metadataHashBytes32 = keccak256(toHex(metadataHash))
        
        // Step 2: First, let's mint a license token from the parent IP
        // This is required before creating a derivative
        try {
            console.log('Minting license token from parent IP...')
            const licenseTokenResult = await client.license.mintLicenseTokens({
                licensorIpId: parentIpId,
                licenseTermsId: parentLicenseTermsId || NonCommercialSocialRemixingTermsId,
                amount: 1,
                receiver: recipientAddress,
                txOptions: {
                    waitForTransaction: true
                }
            })
            console.log('License token minted:', licenseTokenResult)
        } catch (licenseError) {
            console.log('License token minting failed, but continuing...', licenseError)
            // Continue anyway as the token might already exist
        }
        
        // Step 3: Now mint the derivative
        // Use the license terms ID that was passed or default to non-commercial
        const licenseTermsId = parentLicenseTermsId || NonCommercialSocialRemixingTermsId
        
        console.log('Minting derivative NFT...')
        console.log('Parent IP ID:', parentIpId)
        console.log('Recipient:', recipientAddress)
        console.log('License Terms ID:', licenseTermsId)
        
        try {
            const mintResult = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
                spgNftContract: SPGNFTContractAddress,
                recipient: recipientAddress,
                derivData: {
                    parentIpIds: [parentIpId],
                    licenseTermsIds: [licenseTermsId],
                    licenseTemplate: PILTemplateAddress
                },
                ipMetadata: {
                    ipMetadataURI: metadataUrl,
                    ipMetadataHash: metadataHashBytes32,
                    nftMetadataURI: metadataUrl,
                    nftMetadataHash: metadataHashBytes32
                },
                txOptions: {
                    waitForTransaction: true
                }
            })
            
            console.log('Derivative minted and registered:', mintResult)
            
            return {
                success: true,
                childIpId: mintResult.ipId as Address,
                tokenId: mintResult.tokenId,
                txHash: mintResult.txHash
            }
        } catch (mintError: any) {
            // If the error is about license terms not being attached, provide a helpful message
            if (mintError.message?.includes('License terms id')) {
                throw new Error(
                    `The parent IP does not have the required license terms attached. ` +
                    `Please ensure the parent IP (${parentIpId}) has license terms that allow derivatives. ` +
                    `You may need to use a different parent IP or register your own IP first.`
                )
            }
            throw mintError
        }
        
    } catch (error) {
        console.error('Error minting derivative:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }
}

/**
 * Get IP metadata from IPFS
 * @param ipId - The IP ID to fetch metadata for
 * @param pinataApiKey - Optional Pinata API key for fetching from IPFS
 * @returns The metadata object or null if not found
 */
export async function getIPMetadata(ipId: Address, pinataApiKey?: string): Promise<IPMetadata | null> {
    try {
        // For now, we'll return stored metadata from the transaction
        // In a production app, you would:
        // 1. Query the blockchain for the metadata URI
        // 2. Fetch from IPFS using the URI with pinataApiKey
        // 3. Parse and return the metadata
        
        console.log('Fetching metadata for IP:', ipId)
        
        // TODO: Implement actual IPFS fetching using pinataApiKey
        // Example implementation:
        // if (metadataUri && pinataApiKey) {
        //     const response = await fetch(metadataUri, {
        //         headers: {
        //             'Authorization': `Bearer ${pinataApiKey}`
        //         }
        //     })
        //     return await response.json()
        // }
        
        // This is a simplified implementation
        // The actual metadata would be fetched from IPFS or blockchain events
        return null
    } catch (error) {
        console.error('Error fetching IP metadata:', error)
        return null
    }
}

/**
 * Register existing NFT as IP
 * @param nftContract - NFT contract address
 * @param tokenId - Token ID of the NFT
 * @param metadata - Metadata for the IP
 * @returns Result of the registration
 */
export async function registerExistingNFTAsIP(
    nftContract: Address,
    tokenId: bigint,
    metadata: IPMetadata
): Promise<RegisterIPResult> {
    try {
        const client = getStoryClient()
        
        // Upload metadata to IPFS
        console.log('Uploading metadata to IPFS...')
        const metadataHash = await uploadJSONToIPFS({...metadata})
        const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataHash}`
        
        // Register the NFT as an IP Asset
        console.log('Registering NFT as IP Asset...')
        const result = await client.ipAsset.register({
            nftContract,
            tokenId: tokenId.toString(),
            ipMetadata: {
                ipMetadataURI: metadataUrl,
                ipMetadataHash: `0x${metadataHash}`,
                nftMetadataURI: metadataUrl,
                nftMetadataHash: `0x${metadataHash}`
            },
            txOptions: {
                waitForTransaction: true
            }
        })
        
        // Attach license terms
        console.log('Attaching license terms...')
        const licenseResult = await client.license.attachLicenseTerms({
            ipId: result.ipId as Address,
            licenseTermsId: NonCommercialSocialRemixingTermsId,
            txOptions: {
                waitForTransaction: true
            }
        })
        
        return {
            success: true,
            ipId: result.ipId as Address,
            tokenId,
            licenseTermsId: BigInt(NonCommercialSocialRemixingTermsId),
            txHash: licenseResult.txHash
        }
    } catch (error) {
        console.error('Error registering existing NFT as IP:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }
}