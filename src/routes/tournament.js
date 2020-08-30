const express = require('express');
const mongoose = require('mongoose');
const Tournament = require('../model/tournament.js');
const Fixture = require('../model/fixture.js');
const responder = require('../utils/responder.js');
const middleware = require('../middleware/tournament.js');
const logger = require('../utils/logger.js');

const router = express.Router();

router.use(middleware);

// GET /tournaments?skip=0&limit=10
// - get tournaments
// skip: Tournaments to skip in sorted list by startDate
// limit: Number of tournaments to be returned
router.get('/', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    const tournaments = await Tournament.find({}, null, {
      sort: {
        startTime: -1
      },
      skip: Number(req.query.skip),
      limit: Number(req.query.limit)
    });
    res.json(tournaments);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});


// GET /tournaments/:id/fixtures
// - get fixtures of tournament
// - (not preferable)
router.get('/:id/fixtures', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    const fixtures = await Fixture.find({
      tournamentId: mongoose.Types.ObjectId(req.params.id)
    });
    res.json(fixtures);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});


// POST /tournaments
// - post a tournament
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
router.post('/', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.admin: Request received.`);
    const tournament = new Tournament({
      name: req.body.name,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      fixtures: [],
    });
    const tournamentDoc = await tournament.save();
    const fixtures = [];

    for (const element of req.body.fixtures) {
      const fixture = new Fixture({
        t1: element.t1,
        t2: element.t2,
        startTime: element.startTime,
        endTime: element.endTime,
        tournamentId: tournamentDoc.id,
      });
      fixtures.push(fixture.save());
    }

    await Tournament.updateOne({
      _id: mongoose.Types.ObjectId(tournamentDoc.id)
    }, {
      $push: {
        fixtures: {
          $each: (await Promise.all(fixtures)).map((el) => el.id)
        }
      }
    });

    res.status(200).send({ message: 'Tournament successfully created!' });
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.admin: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});

module.exports = router;
