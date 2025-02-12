const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const { prompt } = JSON.parse(event.body);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPEN_AI_KEY2}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: prompt }],
                max_tokens: 200,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API Error:', errorText);
            throw new Error(`OpenAI API Error: ${errorText}`);
        }

        const data = await response.json();
        const facts = data.choices[0]?.message?.content?.trim()?.split('\n') || [];

        return {
            statusCode: 200,
            body: JSON.stringify({ facts }),
        };
    } catch (error) {
        console.error('AI Song Facts Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch song facts' }),
        };
    }
};
