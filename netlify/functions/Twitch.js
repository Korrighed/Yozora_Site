// This runs on Netlify's servers, NOT in the browser
// fetch is available natively in Node 18+

// Store token in memory (resets every ~15 min when function cold starts)
let cachedToken = null;
let tokenExpiry = null;

// Get OAuth token from Twitch
async function getAccessToken() {
    // Check if we have a valid cached token
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials'
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Twitch auth failed: ${data.message}`);
    }

    cachedToken = data.access_token;
    // Token expires in ~60 days, but cache for 1 hour to be safe
    tokenExpiry = Date.now() + (60 * 60 * 1000);

    return cachedToken;
}

// Main handler
export const handler = async (event, context) => {
    // Enable CORS — allowlist prod + local dev
    const allowedOrigins = ['https://yozovtfan.netlify.app', 'http://localhost:8888'];
    const requestOrigin = event.headers?.origin || '';
    const corsOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];
    const headers = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const token = await getAccessToken();
        const broadcasterLogin = 'yozora'; // Your Twitch username
        const clientId = process.env.TWITCH_CLIENT_ID;

        // Get broadcaster info using public endpoint
        const userResponse = await fetch(
            `https://api.twitch.tv/helix/users?login=${broadcasterLogin}`,
            {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const userData = await userResponse.json();

        if (!userData.data || userData.data.length === 0) {
            throw new Error('Broadcaster not found');
        }

        const broadcasterId = userData.data[0].id;

        // Fetch all data in parallel using PUBLIC endpoints
        const [streamRes, videosRes, clipsRes] = await Promise.all([
            // Check if live - PUBLIC endpoint
            fetch(`https://api.twitch.tv/helix/streams?user_login=${broadcasterLogin}`, {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${token}`
                }
            }),

            // Get recent VODs - PUBLIC endpoint
            fetch(`https://api.twitch.tv/helix/videos?user_id=${broadcasterId}&first=5&sort=time&type=archive`, {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${token}`
                }
            }),

            // Get recent clips — fetch 20, sort by date
            fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${broadcasterId}&first=20`, {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${token}`
                }
            })
        ]);

        const [streamData, videosData, clipsData] = await Promise.all([
            streamRes.json(),
            videosRes.json(),
            clipsRes.json()
        ]);

        const recentClips = (clipsData.data || [])
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);

        // Format response
        const response = {
            isLive: streamData.data && streamData.data.length > 0,
            stream: streamData.data[0] || null,
            videos: videosData.data || [],
            clips: recentClips,
            broadcaster: userData.data[0]
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('Twitch API Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Service temporarily unavailable'
            })
        };
    }
};

