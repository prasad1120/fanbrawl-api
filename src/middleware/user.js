const express = require('express');
const Joi = require('@hapi/joi');
const responder = require('../utils/responder.js');
const logger = require('../utils/logger.js');

const router = express.Router();


// GET /users
// - get multiple users
// Request body:
// {
//   "users": ["user1@g.com", "user2@g.com"]
// }
router.get('/', async (req, res, next) => {
  try {
    const schema = Joi.object({
      users: Joi.array()
        .min(1)
        .required()
        .unique(),
    });
    Joi.attempt(req.body, schema);
    next();
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 400, error: e });
  }
});

module.exports = router;
