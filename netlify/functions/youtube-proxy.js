const axios = require('axios');

exports.handler = async (event) => {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const { endpoint, ...params } = JSON.parse(event.body || '{}');

    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/${endpoint}`, {
            params: {
                ...params,
                key: API_KEY,
            },
        });

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
