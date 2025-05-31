import { PinataSDK } from "pinata-web3"

// Initialize Pinata with API key from environment
const pinata = new PinataSDK({
    pinataJwt: process.env.NEXT_PUBLIC_PINATA_API_KEY || process.env.PINATA_API_KEY
});

export async function uploadJSONToIPFS(jsonMetadata: Record<string, unknown>): Promise<string> {
    try {
        console.log('Uploading JSON to IPFS...')
        const { IpfsHash } = await pinata.upload.json(jsonMetadata)
        console.log('JSON uploaded successfully:', IpfsHash)
        return IpfsHash
    } catch (error) {
        console.error('Error uploading JSON to IPFS:', error)
        if (error instanceof Error) {
            throw new Error(`Failed to upload metadata to IPFS: ${error.message}`)
        }
        throw new Error('Failed to upload metadata to IPFS')
    }
}

export async function uploadFileToIPFS(file: File): Promise<string> {
    try {
        console.log('Uploading file to IPFS:', file.name, file.type, file.size)
        const { IpfsHash } = await pinata.upload.file(file)
        console.log('File uploaded successfully:', IpfsHash)
        return IpfsHash
    } catch (error) {
        console.error('Error uploading file to IPFS:', error)
        if (error instanceof Error) {
            throw new Error(`Failed to upload file to IPFS: ${error.message}`)
        }
        throw new Error('Failed to upload file to IPFS')
    }
}

// Legacy function for server-side uploads
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function uploadFileToIPFSFromPath(_filePath: string, _fileName: string, _fileType: string): Promise<string> {
    // This function is kept for backward compatibility but should not be used in browser
    throw new Error('uploadFileToIPFSFromPath is not available in browser environment. Use uploadFileToIPFS instead.')
}









