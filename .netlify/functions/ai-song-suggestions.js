const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        console.log('Function triggered:', event.body);

        const { queue } = JSON.parse(event.body);
        console.log('Queue received:', queue);

        const prompt = `Based on the following queued songs, suggest 3 karaoke songs and provide a dynamic response header (max 10-20 words):\n${queue.join('\n')}\n suggested list format is Song Title - Artist Name`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: prompt }],
                max_tokens: 200, // Accommodate both header and suggestions
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API Error:', errorText);
            throw new Error(`OpenAI API Error: ${errorText}`);
        }

        const data = await response.json();
        console.log('OpenAI response data:', data);

        // Parse response into header and suggestions
        const [header, ...suggestions] = data.choices[0].message.content.trim().split('\n');

        // Remove `**` or other unwanted characters from suggestions
        const cleanedSuggestions = suggestions.map(suggestion =>
            suggestion.replace(/^\*\*\s*|\s*\*\*$/g, '').trim()
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ header, suggestions: cleanedSuggestions }),
        };
    } catch (error) {
        console.error('AI Suggestion Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch AI song suggestions' }),
        };
    }
};
