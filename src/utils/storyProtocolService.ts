"use client"

import { getStoryClient } from './browserConfig'
import { uploadFileToIPFS, uploadJSONToIPFS } from './functions/uploadIPFS'
import { SPGNFTContractAddress, NonCommercialSocialRemixingTermsId, createCommercialRemixTerms } from './utils'
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
        
        // Try with the simpler mintAndRegisterIp method first
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
        
        // Determine license terms based on options
        let licenseTermsId: string | bigint = NonCommercialSocialRemixingTermsId
        let licenseTerms = null
        
        if (licenseOptions) {
            switch (licenseOptions.type) {
                case 'non-commercial':
                    licenseTermsId = NonCommercialSocialRemixingTermsId
                    break
                case 'commercial-use':
                    // Register Commercial Use PIL terms
                    const commercialUseResult = await client.license.registerCommercialUsePIL({
                        defaultMintingFee: licenseOptions.defaultMintingFee || 0,
                        currency: zeroAddress, // Using native token
                        txOptions: {
                            waitForTransaction: true
                        }
                    })
                    licenseTermsId = commercialUseResult.licenseTermsId || '2'
                    console.log('Commercial Use license terms registered:', licenseTermsId)
                    break
                case 'commercial-remix':
                    // For commercial remix, we need to register custom terms
                    licenseTerms = createCommercialRemixTerms({
                        commercialRevShare: licenseOptions.commercialRevShare || 10,
                        defaultMintingFee: licenseOptions.defaultMintingFee || 0
                    })
                    // Register the custom license terms
                    const registerResult = await client.license.registerPILTerms({
                        ...licenseTerms,
                        txOptions: {
                            waitForTransaction: true
                        }
                    })
                    licenseTermsId = registerResult.licenseTermsId || '3'
                    console.log('Custom license terms registered:', licenseTermsId)
                    break
                case 'cc-attribution':
                    const ccTerms = {
                        transferable: true,
                        royaltyPolicy: zeroAddress,
                        defaultMintingFee: 0n,
                        expiration: 0n,
                        commercialUse: true,
                        commercialAttribution: true,
                        commercializerChecker: zeroAddress,
                        commercializerCheckerData: '0x' as `0x${string}`,
                        commercialRevShare: 0,
                        commercialRevCeiling: 0n,
                        derivativesAllowed: true,
                        derivativesAttribution: true,
                        derivativesApproval: false,
                        derivativesReciprocal: true,
                        derivativeRevCeiling: 0n,
                        currency: zeroAddress,
                        uri: ''
                    }
                    const ccResult = await client.license.registerPILTerms({
                        ...ccTerms,
                        txOptions: {
                            waitForTransaction: true
                        }
                    })
                    licenseTermsId = ccResult.licenseTermsId || '4'
                    console.log('CC Attribution license terms registered:', licenseTermsId)
                    break
            }
        }
        
        // Then attach license terms separately
        let licenseResult
        try {
            licenseResult = await client.license.attachLicenseTerms({
                ipId: mintResult.ipId as Address,
                licenseTermsId: licenseTermsId,
                txOptions: {
                    waitForTransaction: true
                }
            })
            console.log('License terms attached:', licenseResult)
        } catch (licenseError) {
            console.warn('Failed to attach license terms:', licenseError)
            // If license attachment fails, we still have a valid IP registration
            // Return success with a note about the license
            return {
                success: true,
                ipId: mintResult.ipId as Address,
                tokenId: mintResult.tokenId,
                txHash: mintResult.txHash,
                error: 'IP registered successfully but license terms attachment failed. You can attach license terms later.'
            }
        }
        
        const result = {
            ...mintResult,
            licenseTermsId: typeof licenseTermsId === 'string' ? BigInt(licenseTermsId) : licenseTermsId
        }
        
        console.log('IP registered successfully:', result)
        
        return {
            success: true,
            ipId: result.ipId as Address,
            tokenId: result.tokenId,
            licenseTermsId: result.licenseTermsId,
            txHash: result.txHash
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