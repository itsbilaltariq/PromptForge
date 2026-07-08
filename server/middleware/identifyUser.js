/**
 * identifyUser middleware
 * Sets req.userId and req.isGuest on every request.
 * Logged-in users  → req.user.googleId  (set by Passport)
 * Guest users      → x-guest-id header  (UUID stored in browser localStorage)
 */
const identifyUser = (req, res, next) => {
  if (req.user) {
    req.userId  = req.user.googleId;
    req.isGuest = false;
  } else {
    const guestId = req.headers['x-guest-id'];
    if (!guestId) {
      return res.status(400).json({ error: 'No user identity provided. Send x-guest-id header or log in.' });
    }
    req.userId  = guestId;
    req.isGuest = true;
  }
  next();
};

module.exports = identifyUser;