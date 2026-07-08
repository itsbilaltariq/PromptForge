const router       = require('express').Router();
const Session      = require('../models/Session');
const identifyUser = require('../middleware/identifyUser');

// GET /api/history — all sessions for current user (newest first)
router.get('/', identifyUser, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('_id title createdAt finalPrompt') // lightweight list, no full conversation
      .lean();
    return res.json(sessions);
  } catch (err) {
    console.error('History fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// GET /api/history/:id — one full session (conversation + final prompt)
router.get('/:id', identifyUser, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id   : req.params.id,
      userId: req.userId, // prevent users from reading each other's sessions
    }).lean();

    if (!session) return res.status(404).json({ error: 'Session not found.' });
    return res.json(session);
  } catch (err) {
    console.error('Session fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch session.' });
  }
});

// DELETE /api/history/:id — delete one session
router.delete('/:id', identifyUser, async (req, res) => {
  try {
    const result = await Session.findOneAndDelete({
      _id   : req.params.id,
      userId: req.userId,
    });

    if (!result) return res.status(404).json({ error: 'Session not found.' });
    return res.json({ message: 'Session deleted.' });
  } catch (err) {
    console.error('Session delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete session.' });
  }
});

module.exports = router;