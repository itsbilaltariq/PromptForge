const router       = require('express').Router();
const Session      = require('../models/Session');
const identifyUser = require('../middleware/identifyUser');

/**
 * POST /api/session/save
 * Body: { conversation: [...], finalPrompt: string, title: string }
 *
 * Saves (or upserts) the completed session for the current user/guest.
 * The title is auto-generated on the frontend as the first 60 chars
 * of the user's original prompt.
 */
router.post('/save', identifyUser, async (req, res) => {
  try {
    const { conversation, finalPrompt, title } = req.body;

    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: 'conversation array is required.' });
    }
    if (!finalPrompt) {
      return res.status(400).json({ error: 'finalPrompt is required.' });
    }

    const session = await Session.create({
      userId      : req.userId,
      isGuest     : req.isGuest,
      title       : (title || 'Untitled Session').slice(0, 60),
      conversation,
      finalPrompt,
    });

    return res.status(201).json({ message: 'Session saved.', sessionId: session._id });

  } catch (err) {
    console.error('Session save error:', err.message);
    return res.status(500).json({ error: 'Failed to save session.' });
  }
});

module.exports = router;