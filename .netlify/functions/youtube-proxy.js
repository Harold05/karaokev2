const axios = require('axios');

exports.handler = async (event) => {
    const API_KEY = process.env.YOUTUBE_API_KEY; // Use the environment variable for the API key

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
