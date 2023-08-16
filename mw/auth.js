const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  const token = req.body.token || req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');
  try {
    const verified = jwt.verify(token, 'jwtPrivateKey');
    console.log("verified:: ",verified)
    req.User = verified;  
    next();
  } catch (err) {
    res.status(400).send(err);
}
 }


