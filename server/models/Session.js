const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role   : { type: String, enum: ['system', 'user', 'assistant'], required: true },
  content: { type: String, required: true },
});

const sessionSchema = new mongoose.Schema({
  userId     : { type: String, required: true, index: true },
  isGuest    : { type: Boolean, default: true },
  // Auto-generated from first 60 chars of the user's original prompt
  title      : { type: String, default: 'Untitled Session' },
  conversation: [messageSchema],
  finalPrompt: { type: String, default: '' },
  createdAt  : { type: Date, default: Date.now },
});

module.exports = mongoose.model('Session', sessionSchema);