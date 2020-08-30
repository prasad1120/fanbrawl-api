const express = require('express');
const mongoose = require('mongoose');
const Fixture = require('../model/fixture.js');
const responder = require('../utils/responder.js');
const middleware = require('../middleware/fixture.js');
const logger = require('../utils/logger.js');

const router = express.Router();
router.use(middleware);


// GET /fixtures
// - get multiple fixtures
// - (preferable)
// Request body:
// {
//  "fixtureIds" = ["fId1", "fId2"]
// }
router.get('/', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    const fixtures = await Fixture.find({
      _id: {
        $in: req.body.fixtureIds.map((el) => mongoose.Types.ObjectId(el))
      }
    });
    res.status(200).json(fixtures);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});


// GET /fixtures/independent?skip=0&limit=10
// - get independent fixtures
// skip: Fixtures to skip in sorted list of independent fixtures by startDate
// limit: Number of independent fixtures to be returned
router.get('/independent', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    const result = await Fixture.find({
      tournamentId: {
        $exists: false
      }
    },
    null,
    {
      sort: {
        startTime: -1
      },
      skip: Number(req.query.skip),
      limit: Number(req.query.limit)
    });
    res.status(200).json(result);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});


// GET /fixtures/:id'
// - get a Fixture
router.get('/:id', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    const fixture = await Fixture.find({ _id: mongoose.Types.ObjectId(req.params.id) });
    res.status(200).json(fixture);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});


// POST /fixtures
// - post an indpendent fixture
// Request body:
// {
//  "t1": "Bangladesh",
//  "t2": "South Africa",
//  "startTime": "2020-10-01T15:00Z",
//  "endTime": "2020-10-01T21:30Z"
// }
router.post('/', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.admin: Request received.`);
    const fixture = new Fixture({
      t1: req.body.t1,
      t2: req.body.t2,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    });
    const fixtureDoc = await fixture.save();
    res.status(200).json(fixtureDoc);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.admin: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});

module.exports = router;
