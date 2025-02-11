const fetch = require('node-fetch');

export async function handler(event) {
    try {
        console.log('Function triggered:', event.body);

        const { queue } = JSON.parse(event.body);
        console.log('Queue received:', queue);

        const prompt = `Based on the following queued songs, suggest 5 karaoke songs and provide a dynamic response header (max 10-20 words):\n${queue.join('\n')}\n`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: prompt }],
                max_tokens: 200, // Increased to accommodate both the header and suggestions
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API Error:', errorText);
            throw new Error(`OpenAI API Error: ${errorText}`);
        }

        const data = await response.json();
        console.log('OpenAI response data:', data);

        const [header, ...suggestions] = data.choices[0].message.content.trim().split('\n');
        const cleanedSuggestions = suggestions.map(suggestion => suggestion.replace(/^\*\*\s*|\s*\*\*$/g, '').trim()); // Remove **

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
}
