const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  const token = req.body.token || req.header('Authorization');
  if (!token) return res.status(401).send('Access denied. No token provided.');
//   try {
//     const verified = jwt.verify(token, config.get('jwtPrivateKey'));
//     req.User = verified;  
//     next();
//   } catch (err) {
//     res.status(400).send(err);
// }
console.log(token);
const bearerToken = token.split(' ');
console.log(bearerToken);
  if (!bearerToken) return res.status(401).send('Accesss denied. No token provided.');
  jwt.verify(JSON.stringify(bearerToken),config.get('jwtPrivateKey'), (err, payload)=>{
    if (err) return res.status(401).send(err);
    req.user = payload;
    next();
  })
//    try {
//     const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
//     return decoded;
//     //  req.user = decoded;
//      next();
//   }
//   catch (ex) {
//     //res.status(400).send('Invalid token.');
//     console.log(ex);
//  }
 }


