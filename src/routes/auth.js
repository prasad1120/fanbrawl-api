const express = require('express');
const fawn = require('fawn');
const mongoose = require('mongoose');
const User = require('../model/user.js');
const Group = require('../model/group.js');
const League = require('../model/league.js');
const Authentication = require('../auth/auth.js');
const responder = require('../utils/responder.js');
const logger = require('../utils/logger.js');

const router = express.Router();

// '/login' POST login
router.post('/login', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}: Request received`);
    const credentials = await Authentication.authenticate(req.get('Authentication'));
    res.locals.user = credentials.user;
    res.status(200).json(credentials);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served`);
  } catch (e) {
    logger.error(JSON.stringify(e));
    responder({ res, status: 500, error: e });
  }
});

// '/logout' POST logout
// router.post('/logout', async (req, res) => {
//   // Yet to implement
// });

// '/deleteAccount' DELETE user
router.delete('/deleteAccount', async (req, res) => {
  logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received`);
  const { email } = res.locals.user.id;
  const task = fawn.Task();
  const newId = mongoose.Types.ObjectId();
  try {
    // eslint-disable-next-line no-underscore-dangle
    const _user = await User.findById(email);

    const user = new User({
      _id: newId,
      groups: _user.groups,
      jwt: '',
      isDeleted: true,
      name: 'User',
      pic: ''
    });

    task.save(User, user);
    task.remove(User, { _id: email });
    task.update(Group, { users: email }, { $set: { 'users.$': newId } });
    task.update(League, { users: email }, { $set: { 'users.$': newId } });

    console.log(await task.run({ useMongoose: true }));

    res.status(200).json({ message: 'Account successfully deleted!' });
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served`);
  } catch (e) {
    logger.error(JSON.stringify(e));
    responder({ res, status: 500, error: e });
  }
});

module.exports = router;
