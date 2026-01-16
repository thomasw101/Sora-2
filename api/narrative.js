// /api/narrative.js - Vercel Serverless Function
// Handles: Price fetch → Gemini narrative → Google TTS

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize TTS with credentials from env
const ttsCredentials = JSON.parse(process.env.GOOGLE_TTS_CREDENTIALS || '{}');
const ttsClient = new TextToSpeechClient({ credentials: ttsCredentials });

// System prompt for narrative generation
const SYSTEM_PROMPT = `You narrate Sora's story as one continuous flow. Each beat connects directly to the last.

RULES:
- Never mention crypto, trading, price, market, moon, pump
- 1-2 short sentences only (15-30 words)
- Continue directly from the previous beat
- Simple, clear prose - not overly literary
- End each beat so the next can continue naturally

THE STORY:
Sora is a 15-year-old boy abandoned at a burnt shrine. He has a wooden fox carving (from his mother) and a tainted blade. He survives alone in a harsh world. The fox and blade can never be lost.

ERAS:
- THE_ASH ($0-40K): Burnt shrine, dead forest, winter. Scavenging, hiding, surviving.
- THE_GATE ($40K-60K): Iron gate at ruins' edge. First real danger.
- THE_RONIN ($60K-1M): Open roads, wilderness. Wandering, meeting others.
- THE_EMPIRE ($1M-100M): Fortified territory. Leading, building.
- THE_BEYOND ($100M+): Throne, legacy. Ruler, legend.

MOMENTUM:
- UP: Small win, progress, finding something
- DOWN: Setback, difficulty, obstacle (Sora adapts)
- STABLE: Quiet moment, observation, rest

Output ONLY the narrative text, nothing else.`;

// Era thresholds
function getEra(mc) {
  if (mc < 40000) return 'THE_ASH';
  if (mc < 60000) return 'THE_GATE';
  if (mc < 1000000) return 'THE_RONIN';
  if (mc < 100000000) return 'THE_EMPIRE';
  return 'THE_BEYOND';
}

// State (in production, use a database or KV store)
let state = {
  lastMC: 0,
  lastBeat: '',
  beatCount: 0
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const tokenAddress = req.query.token || process.env.TOKEN_ADDRESS;
    
    if (!tokenAddress || tokenAddress === 'YOUR_TOKEN_ADDRESS_HERE') {
      return res.status(200).json({
        narrative: "The story awaits... Connect your token to begin.",
        era: 'THE_ASH',
        marketCap: 0,
        momentum: 'STABLE',
        beatCount: 0,
        audio: null
      });
    }

    // 1. Fetch price from DexScreener
    const priceRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
    const priceData = await priceRes.json();
    
    let marketCap = 0;
    if (priceData.pairs && priceData.pairs.length > 0) {
      marketCap = parseFloat(priceData.pairs[0].marketCap) || 0;
    }

    // 2. Calculate momentum
    let momentum = 'STABLE';
    if (state.lastMC > 0) {
      const change = ((marketCap - state.lastMC) / state.lastMC) * 100;
      if (change > 0.5) momentum = 'UP';
      else if (change < -0.5) momentum = 'DOWN';
    }

    const era = getEra(marketCap);

    // 3. Generate narrative with Gemini
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT
    });

    const prompt = `
Era: ${era}
Market Cap: $${Math.round(marketCap).toLocaleString()}
Momentum: ${momentum}
Previous beat: "${state.lastBeat || 'The story begins'}"

Generate the next beat (1-2 sentences, continue from previous):`;

    const result = await model.generateContent(prompt);
    const narrative = result.response.text().trim().replace(/^\[|\]$/g, '').replace(/^"|"$/g, '');

    // 4. Generate TTS audio
    let audioBase64 = null;
    const generateAudio = req.query.audio !== 'false';
    
    if (generateAudio && ttsCredentials.private_key) {
      try {
        const [ttsResponse] = await ttsClient.synthesizeSpeech({
          input: { text: narrative },
          voice: {
            languageCode: 'en-GB',
            name: 'en-GB-Neural2-D',
            ssmlGender: 'MALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.9,
            pitch: -2.0
          }
        });
        audioBase64 = ttsResponse.audioContent.toString('base64');
      } catch (ttsError) {
        console.error('TTS Error:', ttsError.message);
      }
    }

    // 5. Update state
    state.lastMC = marketCap;
    state.lastBeat = narrative;
    state.beatCount++;

    // 6. Return response
    return res.status(200).json({
      narrative,
      era,
      marketCap,
      momentum,
      beatCount: state.beatCount,
      audio: audioBase64
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error.message,
      narrative: "The ink runs dry... Please try again.",
      era: 'THE_ASH',
      marketCap: 0,
      momentum: 'STABLE',
      beatCount: state.beatCount,
      audio: null
    });
  }
}
