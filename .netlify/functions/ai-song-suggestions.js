const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const { queue } = JSON.parse(event.body);
        const prompt = `Based on the following queued songs, suggest 5 karaoke songs with the format "Song Title - Artist":\n${queue.join('\n')}\n`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: prompt }],
                max_tokens: 150,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const suggestions = data.choices[0].message.content.trim().split('\n');

        return {
            statusCode: 200,
            body: JSON.stringify({ suggestions }),
        };
    } catch (error) {
        console.error('AI Suggestion Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch AI song suggestions' }),
        };
    }
};
