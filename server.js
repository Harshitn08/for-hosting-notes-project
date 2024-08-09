const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.static('public'));
app.use(express.json());

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/ask', async (req, res) => {
    const { question, formattedNotes } = req.body;

    try {
        // Use Gemini Pro model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `You are a helpful assistant that answers questions based on the given notes ONLY. DO NOT add any extra information from your own knowledge.

Notes:
${formattedNotes}

Question: ${question}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text();

        res.json({ answer });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
