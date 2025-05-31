# Deployment Guide for Story Protocol App

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)

## Pre-deployment Checklist

### 1. Environment Variables
Since users will provide their own Pinata API keys and private keys through the UI, you don't need to set these in Vercel. However, ensure your `.env.example` is up to date:

```env
# Story Protocol Configuration
NEXT_PUBLIC_STORY_NETWORK=aeneid

# Users will provide these through the UI:
# - Private Key
# - Pinata API Key
```

### 2. Update .gitignore
Make sure `.env.local` is in your `.gitignore` file to avoid committing sensitive data.

### 3. Remove any hardcoded credentials
Double-check that no API keys or private keys are hardcoded in your source files.

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Run in your project directory:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Link to existing project or create new
   - Choose project name
   - Confirm settings

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Go to https://vercel.com/new

3. Import your GitHub repository

4. Configure project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. Add Environment Variables (if any):
   - `NEXT_PUBLIC_STORY_NETWORK`: aeneid

6. Click "Deploy"

## Post-deployment

### 1. Custom Domain (Optional)
- Go to your project settings in Vercel
- Add your custom domain under "Domains"

### 2. Environment Variables
- No need to add private keys or Pinata keys
- Users will input these directly in the app

### 3. Monitor Performance
- Check Vercel Analytics
- Monitor build times and errors

## Important Security Notes

1. **Never commit private keys** to your repository
2. **Users are responsible** for keeping their own private keys secure
3. **Pinata API keys** are entered by users and not stored by your app
4. **Use HTTPS only** (Vercel provides this by default)

## Troubleshooting

### Build Errors
- Check Node.js version compatibility
- Ensure all dependencies are in `package.json`
- Review build logs in Vercel dashboard

### Runtime Errors
- Check browser console for client-side errors
- Review Vercel Functions logs for API errors
- Ensure all environment variables are properly prefixed with `NEXT_PUBLIC_`

## Production Considerations

1. **Rate Limiting**: Consider implementing rate limiting for API calls
2. **Error Tracking**: Set up error tracking (e.g., Sentry)
3. **Analytics**: Add analytics to track usage
4. **Terms of Service**: Add ToS regarding private key usage
5. **Disclaimer**: Add clear disclaimers about user responsibility for their keys

## Useful Commands

```bash
# Build locally to test
npm run build

# Run production build locally
npm run start

# Check for TypeScript errors
npm run type-check

# Lint your code
npm run lint
```

## Support

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Story Protocol Documentation: https://docs.story.foundation