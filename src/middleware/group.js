const express = require('express');
const Joi = require('@hapi/joi');
const constraints = require('./constraints.js');
const responder = require('../utils/responder.js');
const logger = require('../utils/logger.js');

const router = express.Router();


// POST /groups
// - post a group with multiple users
// Request body:
// {
//   "name": "Group name"
//   "users": ["user1@g.com", "user2@g.com"]
// }
router.post('/', (req, res, next) => {
  try {
    const schema = Joi.object({
      name: constraints.groupName,
      users: constraints.usersArray
    });
    Joi.attempt(req.body, schema);
    next();
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 400, error: e });
  }
});


// POST /groups/:id/leagues
// - post a league
// Request body:
// {
//   "users": ["user1@g.com", "user2@g.com"],
//   "tournamentId": "_tournamentId" OR "fixtureId": "_fixtureId"
// }
router.post('/:id/leagues', (req, res, next) => {
  try {
    const schema = Joi.object({
      users: constraints.usersArray,
      tournamentId: Joi.string(),
      fixtureId: Joi.string()
    });
    Joi.attempt(req.body, schema);
    next();
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 400, error: e });
  }
});


// PUT /groups/:id/add-users
// Request body:
// {
//  "users": ["user1@g.com", "user2@g.com"]
// }
router.put('/:id/add-users', async (req, res, next) => {
  try {
    const schema = Joi.object({
      users: constraints.usersArray
    });
    Joi.attempt(req.body, schema);
    next();
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 400, error: e });
  }
});


// PUT /groups/:id/change-name
// Request body:
// {
//   "name": "Group name"
// }
router.put('/:id/change-name', async (req, res, next) => {
  try {
    const schema = Joi.object({
      name: constraints.groupName
    });
    Joi.attempt(req.body, schema);
    next();
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 400, error: e });
  }
});


// PUT /groups/:id/remove-users
// Request body:
// {
//   "users": ["user1@g.com", "user2@g.com"]
// }
router.put('/:id/remove-users', async (req, res, next) => {
  try {
    const schema = Joi.object({
      users: constraints.usersArray
    });
    Joi.attempt(req.body, schema);
    next();
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 400, error: e });
  }
});


// GET /groups
// - get groups by groupIds
// Request body:
// {
//   "groupIds": ["groupId1", "groupId2"]
// }
router.get('/', (req, res, next) => {
  try {
    const schema = Joi.object({
      groupIds: Joi.array()
        .required()
        .items(Joi.string())
        .min(1)
    });
    Joi.attempt(req.body, schema);
    next();
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 400, error: e });
  }
});

module.exports = router;
