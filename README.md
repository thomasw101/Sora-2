# $SORA Website

Integrated website with live AI-generated storytelling based on token price.

## Setup

### 1. Deploy to Vercel

```bash
cd sora-website
vercel
```

Or drag the folder to vercel.com

### 2. Set Environment Variables in Vercel

Go to your project → Settings → Environment Variables

Add these:

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | `AIzaSyCNLMvYd88fX_Q2RlM5UPVs9OqUi-hXmXc` |
| `GOOGLE_TTS_CREDENTIALS` | (paste the entire JSON from google-credentials.json) |
| `TOKEN_ADDRESS` | Your token contract address (add after launch) |

### 3. Update Config in index.html

Before deploying, edit the CONFIG section in index.html:

```javascript
const CONFIG = {
  TOKEN_ADDRESS: 'YOUR_TOKEN_ADDRESS_HERE',  // Your contract address
  BUY_URL: 'https://bags.fm/YOUR_COIN',      // Your bags.fm link
  NARRATIVE_INTERVAL: 25000                   // 25 seconds between beats
};
```

### 4. Launch Flow

1. Create coin on bags.fm
2. Copy contract address
3. Copy bags.fm URL  
4. Update CONFIG in index.html
5. Push to Vercel (or redeploy)
6. Done!

## Features

- **Hero Section**: Title, tagline, buy button
- **Live Story**: Scroll on desk with typewriter effect
- **Drawing**: Users can draw on the scroll (ink fades)
- **Sound Toggle**: Enable/disable TTS voice
- **Tech Pipeline**: Shows price → AI → story → voice flow
- **The Foundling**: Lore section
- **Tokenomics**: Supply, tax, contract address
- **Responsive**: Works on mobile

## Files

```
sora-website/
├── index.html          # Main website
├── api/
│   └── narrative.js    # Serverless API (Gemini + TTS)
├── package.json        # Dependencies
├── vercel.json         # Vercel config
└── README.md           # This file
```

## How It Works

1. Frontend calls `/api/narrative` every 25 seconds
2. API fetches price from DexScreener
3. API generates narrative with Gemini AI
4. API generates voice with Google TTS
5. Frontend displays text with typewriter effect
6. If sound enabled, plays audio

## Environment Variables

Your API keys are stored securely in Vercel environment variables - they're never exposed to users.

- `GEMINI_API_KEY`: Your Gemini API key
- `GOOGLE_TTS_CREDENTIALS`: Full JSON from Google Cloud service account
- `TOKEN_ADDRESS`: Optional, can also be set in frontend CONFIG
