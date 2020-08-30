const jwt = require('./jwt.js');
const googleAuth = require('./google-auth.js');
const User = require('../model/user.js');
const responder = require('../utils/responder.js');
const logger = require('../utils/logger.js');
const CustomError = require('../utils/CustomError.js');
const config = require('../config.js');

const checkToken = (req) => {
  let token = req.get('Authorization');
  if (!token) {
    throw CustomError('TokenNotFound');
  }
  token = token.replace('Bearer ', '');
  return jwt.verify(token);
};

const getUser = async (idToken) => {
  const response = await googleAuth.getGoogleUser(idToken);
  const content = {
    token: jwt.generateToken(response),
    user: response,
  };
  return content;
};

class Authentication {
  static filter() {
    return (req, res, next) => {
      try {
        logger.info(`${req.method}.${req.originalUrl.substring(1)}.filter()`);
        if (['/tournaments', '/fixtures'].includes(req.url) && req.method === 'POST') {
          if (req.get('Authentication') !== config.adminPassword) {
            throw CustomError('WrongAdminpassword');
          }
        } else if (!['/login'].includes(req.url)) {
          res.locals.user = { id: checkToken(req).email };
        }
        logger.info(`${req.method}.${req.originalUrl.substring(1)}.filter(): Passed filter`);
        next();
      } catch (e) {
        logger.error(e.stack);
        res.status(401).json({ error: 'not_authorized' });
        responder({ res, status: 500, error: e });
      }
    };
  }

  static async authenticate(idToken) {
    const principal = await getUser(idToken);
    const query = { _id: principal.user.email };
    const update = { name: principal.user.name, pic: principal.user.pic };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const user = await User.findOneAndUpdate(query, update, options);
    return { token: principal.token, user };
  }
}

module.exports = Authentication;
