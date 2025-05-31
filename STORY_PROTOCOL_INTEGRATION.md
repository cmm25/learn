# Story Protocol Integration Guide

This application integrates with Story Protocol to allow users to upload text or PDF files, register them as intellectual property (IP), and mint them as NFTs on the blockchain.

## Features

- **File Upload**: Support for text (.txt) and PDF (.pdf) files up to 10MB
- **IPFS Storage**: Files are automatically uploaded to IPFS via Pinata
- **IP Registration**: Content is registered as intellectual property on Story Protocol
- **NFT Minting**: Automatically mints an NFT representing the IP
- **License Terms**: Applies Non-Commercial Social Remixing license terms by default

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Copy `.env.example` to `.env.local` and fill in the required values:
   
   ```env
   # Story Protocol Configuration
   NEXT_PUBLIC_STORY_NETWORK=aeneid # Use 'aeneid' for testnet or 'mainnet' for production
   
   # Pinata Configuration for IPFS
   NEXT_PUBLIC_PINATA_API_KEY=your_pinata_jwt_token
   ```

3. **Get a Pinata API Key**
   - Sign up at [Pinata](https://pinata.cloud)
   - Generate a JWT token from your account settings
   - Add it to your `.env.local` file

## Usage

1. **Access the Form**
   Navigate to `/story-form` in your application

2. **Fill in the Form**
   - **Title**: Enter a title for your IP
   - **Description**: Provide a detailed description
   - **Creator Name**: Your name or pseudonym
   - **File**: Upload a .txt or .pdf file (max 10MB)
   - **Private Key**: Your wallet private key (64 hex characters without 0x prefix)

3. **Submit**
   Click "Register IP & Mint NFT" to:
   - Upload your file to IPFS
   - Register it as IP on Story Protocol
   - Mint an NFT to your wallet address

4. **View Results**
   - Success: You'll receive an IP ID and transaction hash
   - Transaction can be viewed on the Story Protocol explorer

## Architecture

### Key Components

1. **`/utils/storyProtocolService.ts`**
   - Main service for interacting with Story Protocol
   - Handles file upload, IP registration, and NFT minting

2. **`/utils/browserConfig.ts`**
   - Client-side configuration for Story Protocol SDK
   - Manages wallet connections and network settings

3. **`/utils/functions/uploadIPFS.ts`**
   - Handles file uploads to IPFS via Pinata
   - Supports both file and JSON metadata uploads

4. **`/pages/form.tsx`**
   - Main form component with validation
   - Handles user input and displays results

5. **`/hooks/useStoryProtocol.ts`**
   - React hook for wallet management
   - Handles connection state and errors

## License Terms

By default, the integration uses **Non-Commercial Social Remixing** license terms:
- Allows derivatives
- Requires attribution
- Non-commercial use only
- Derivatives must use the same license

## Network Support

- **Aeneid (Testnet)**: Default network for testing
- **Mainnet**: Production network (requires real tokens)

## Error Handling

The integration includes comprehensive error handling for:
- Invalid private keys
- File upload failures
- Network errors
- Transaction failures
- IPFS upload issues

## Security Notes

⚠️ **Important**: 
- Never share your private key
- Consider using a dedicated wallet for testing
- Use testnet (Aeneid) for development
- Store private keys securely in production

## Troubleshooting

1. **"Story client not initialized"**
   - Ensure you've entered a valid private key
   - Check that the wallet connection succeeded

2. **"Failed to upload to IPFS"**
   - Verify your Pinata API key is correct
   - Check your internet connection
   - Ensure file size is under 10MB

3. **Transaction Failures**
   - Ensure you have sufficient tokens for gas
   - Check network status
   - Verify contract addresses are correct

## Additional Resources

- [Story Protocol Documentation](https://docs.story.foundation)
- [Story Protocol Explorer (Testnet)](https://aeneid.explorer.story.foundation)
- [Pinata Documentation](https://docs.pinata.cloud)