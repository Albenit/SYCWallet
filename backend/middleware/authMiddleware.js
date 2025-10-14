const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'no_token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { address: payload.address }; 
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'bad_token' });
  }
};