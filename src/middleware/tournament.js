/* eslint-disable no-restricted-globals */
const express = require('express');
const Joi = require('@hapi/joi');
const constraints = require('./constraints.js');
const responder = require('../utils/responder.js');
const logger = require('../utils/logger.js');
const CustomError = require('../utils/CustomError.js');

const router = express.Router();

// GET /tournaments?skip=0&limit=10
// - get tournaments
// skip: Tournaments to skip in sorted list by startDate
// limit: Number of tournaments to be returned
router.get('/', (req, res, next) => {
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


// POST /tournaments
//  - post a tournament
// Request body:
// {
//  "name": "ICC women cup",
//  "startTime": "2020-10-01T15:00Z",
//  "endTime": "2020-10-15T21:30Z",
//  "fixtures": [
//    {
//      "t1": "Bangladesh",
//      "t2": "South Africa",
//      "startTime": "2020-10-01T15:00Z",
//      "endTime": "2020-10-01T21:30Z"
//    },
//    {
//      "t1": "West Indies",
//      "t2": "New Zealand",
//      "startTime": "2020-10-03T15:00Z",
//      "endTime": "2020-10-03T21:30Z"
//    }]
// }
router.post('/', (req, res, next) => {
  try {
    const fixtureSchema = Joi.object(constraints.fixture());
    const tournamentSchema = Joi.object({
      name: Joi.string()
        .min(1)
        .required(),
      startTime: constraints.startTime,
      endTime: constraints.endTime,
      fixtures: Joi.array()
        .required()
        .items(fixtureSchema)
        .min(1)
    });

    Joi.attempt(req.body, tournamentSchema);
    next();
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 400, error: e });
  }
});

module.exports = router;
