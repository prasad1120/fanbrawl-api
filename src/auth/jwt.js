const jwt = require('jsonwebtoken');
const config = require('../config.js');

module.exports.verify = (token) => jwt.verify(token, config.jwtSecret);

module.exports.generateToken = (user) => jwt.sign(
  {
    id: user.id,
    email: user.email,
  }, config.jwtSecret, { expiresIn: '30 days' }
);
