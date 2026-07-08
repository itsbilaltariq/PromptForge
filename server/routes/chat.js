require('dotenv').config();
const router       = require('express').Router();
const Groq         = require('groq-sdk');
const systemPrompt = require('../prompts/systemPrompt');
const identifyUser = require('../middleware/identifyUser');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * POST /api/chat
 * Body: { messages: [ { role, content }, ... ] }
 *
 * The frontend sends the FULL conversation history on every request
 * (Groq/LLMs are stateless — no memory between calls).
 * We prepend the system prompt if it isn't already the first message.
 */
router.post('/', identifyUser, async (req, res) => {
  try {
    let { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required.' });
    }

    // Always ensure system prompt is the very first message
    if (messages[0]?.role !== 'system') {
      messages = [{ role: 'system', content: systemPrompt }, ...messages];
    }

    const completion = await groq.chat.completions.create({
      model    : 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? '';
    return res.json({ reply });

  } catch (err) {
    console.error('Groq API error:', err.message);
    return res.status(500).json({ error: 'AI request failed. Please try again.' });
  }
});

module.exports = router;
