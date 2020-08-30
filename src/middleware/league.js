const express = require('express');
const Joi = require('@hapi/joi');
const constraints = require('./constraints.js');
const responder = require('../utils/responder.js');
const logger = require('../utils/logger.js');

const router = express.Router();


// GET /leagues
// - get multiple leagues
// Request body:
// {
//   "leagueIds": ["leagueId1", "leagueId2"]
// }
router.get('/', (req, res, next) => {
  try {
    const schema = Joi.object({
      leagueIds: constraints.usersArray
    });
    Joi.attempt(req.body, schema);
    next();
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 400, error: e });
  }
});


// PUT /leagues/:leagueId/add-users
// Request body:
// {
//  "users": ["user1@g.com", "user2@g.com"]
// }
router.get('/:id/add-users', (req, res, next) => {
  try {
    const schema = Joi.object({
      leagueIds: constraints.usersArray
    });
    Joi.attempt(req.body, schema);
    next();
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 400, error: e });
  }
});

module.exports = router;
