require('dotenv').config();
const router         = require('express').Router();
const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User           = require('../models/User');
const Session        = require('../models/Session');

// ── Passport config ───────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID    : process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL : 'http://localhost:5000/auth/google/callback',
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email   : profile.emails[0].value,
        name    : profile.displayName,
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.googleId));

passport.deserializeUser(async (googleId, done) => {
  try {
    const user = await User.findOne({ googleId });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ── Routes ────────────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5174?error=auth_failed',
  }),
  async (req, res) => {
    const guestId = req.query.state || req.headers['x-guest-id'];
    if (guestId) {
      await Session.updateMany(
        { userId: guestId, isGuest: true },
        { userId: req.user.googleId, isGuest: false }
      );
    }
    res.redirect('http://localhost:5174');
  }
);

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('http://localhost:5174');
  });
});

router.get('/me', (req, res) => {
  if (req.user) {
    return res.json({
      loggedIn : true,
      googleId : req.user.googleId,
      name     : req.user.name,
      email    : req.user.email,
    });
  }
  return res.json({ loggedIn: false });
});

module.exports = router;