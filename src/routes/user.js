const express = require('express');
const User = require('../model/user.js');
const Group = require('../model/group.js');
const logger = require('../utils/logger.js');
const responder = require('../utils/responder.js');
const middleware = require('../middleware/user.js');

const usersRouter = express.Router();

usersRouter.use(middleware);

// GET /users
// - get multiple users
// Request body:
// {
//   "users": ["user1@g.com", "user2@g.com"]
// }
usersRouter.get('/', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    const users = await User.find({
      _id: {
        $in: req.body.users
      }
    });
    res.json(users);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});

// GET /users/:id/groups
// - get groups of a user
usersRouter.get('/:id/groups', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    const groups = await Group.find({ users: req.params.id });
    res.json(groups);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});


const userRouter = express.Router();

// GET /user/groups
// - get groups of authenticated user
userRouter.get('/groups', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    const groups = await Group.find({ users: res.locals.user.id });
    res.json(groups);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});

module.exports = {
  usersRoute: usersRouter,
  userRoute: userRouter
};
