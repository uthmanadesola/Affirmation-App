const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { category = 'motivation', mood = 'positive' } = req.body || {};
        
        const prompt = `Write a short ${mood} affirmation about ${category}. Only respond with the affirmation itself, nothing else. Keep it under 20 words.`;

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen2:0.5b',
                prompt,
                stream: false
            })
        });

        const data = await response.json();
        const text = data.response?.trim() || 'You are amazing and capable of great things!';
        
        res.json({ text });
    } catch (error) {
        console.error('AI generation error:', error);
        // Fallback affirmation
        res.json({ text: 'You have the strength to overcome any challenge today.' });
    }
});

module.exports = router;

