const axios = require('axios');

const YT_API_KEYS = [
    process.env.YT_API_KEY1,
    process.env.YT_API_KEY2,
    process.env.YT_API_KEY3,
    process.env.YT_API_KEY4
];
let currentKeyIndex = 0;

function getNextApiKey() {
    const key = YT_API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % YT_API_KEYS.length; // Rotate index
    return key;
}

exports.handler = async (event) => {
    const API_KEY = getNextApiKey(); // Use the rotating API key function

    // Parse the request body
    let { processedQuery, excludeIds = [] } = JSON.parse(event.body || '{}');

    if (!processedQuery) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "processedQuery is required" }),
        };
    }

    try {
        // Construct the API URL
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3` +
            `&q=${encodeURIComponent(processedQuery)}` +
            `&type=video&key=${API_KEY}` +
            `&cache=${Date.now()}` +
            (excludeIds.length > 0 ? `&excludedIds=${excludeIds.join(',')}` : '');

        // Make the API request
        const response = await axios.get(url);

        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        return {
            statusCode: error.response?.status || 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
