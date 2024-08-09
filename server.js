const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config(); 

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.post('/api/ask', async (req, res) => {
    const { question, formattedNotes } = req.body;
    const API_URL = 'https://api.openai.com/v1/chat/completions';
    const API_KEY = process.env.OPENAI_API_KEY;
    //console.log('API_KEY:', API_KEY);
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {"role": "system", "content": "You are a helpful assistant that answers questions based on the given notes ONLY. DO NOT add any extra information from your own knowledge."},
                    {"role": "user", "content": `Notes:\n${formattedNotes}\n\nQuestion: ${question}`}
                ]
              ,temperature:0.2 //adjust for creativity
            })
          
          
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.json({ answer: data.choices[0].message.content });
    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});