/* eslint-disable no-restricted-globals */
const express = require('express');
const Joi = require('@hapi/joi');
const constraints = require('./constraints.js');
const responder = require('../utils/responder.js');
const logger = require('../utils/logger.js');
const CustomError = require('../utils/CustomError.js');

const router = express.Router();

// GET /fixtures
// - get multiple fixtures
// - (preferable)
// Request body:
// {
//  "fixtureIds" = ["fId1", "fId2"]
// }
router.put('/', async (req, res, next) => {
  try {
    const schema = Joi.object({
      fixtureIds: constraints.usersArray
    });
    Joi.attempt(req.body, schema);
    next();
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 400, error: e });
  }
});


// GET /fixtures/independent?skip=0&limit=10
// - get independent fixtures
// skip: Fixtures to skip in sorted list of independent fixtures by startDate
// limit: Number of independent fixtures to be returned
router.get('/independent', (req, res, next) => {
  try {
    if (isNaN(req.query.skip)
        || isNaN(req.query.limit)
        || req.query.skip < 0
        || req.query.limit < 1
        || req.query.limit > 30) {
      throw CustomError('InvalidParams', 'Invalid values of \'skip\' and \'limit\'');
    }
    next();
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 400, error: e });
  }
});


// POST /fixtures
// - post a independent fixture
// Request body:
// {
//  "t1": "Bangladesh",
//  "t2": "South Africa",
//  "startTime": "2020-10-01T15:00Z",
//  "endTime": "2020-10-01T21:30Z"
// }
router.post('/', (req, res, next) => {
  try {
    const schema = Joi.object(constraints.fixture());
    Joi.attempt(req.body, schema);
    next();
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 400, error: e });
  }
});

module.exports = router;
