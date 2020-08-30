const express = require('express');
const mongoose = require('mongoose');
const League = require('../model/league.js');
const responder = require('../utils/responder.js');
const middleware = require('../middleware/league.js');
const logger = require('../utils/logger.js');

const router = express.Router();

router.use(middleware);

// PUT /leagues/:id/add-users
// Request body:
// {
//  "users": ["user1@g.com", "user2@g.com"]
// }
router.put('/:id/add-users', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);

    await League.updateOne({
      _id: mongoose.Types.ObjectId(req.params.id)
    }, {
      $set: {
        updatedAt: Date.now()
      },
      $addToSet: {
        users: {
          $each: req.body.users
        }
      }
    });

    res.status(200).send({ message: 'Users successfully added' });
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send(e);
    responder({ res, status: 500, error: e });
  }
});

// Yet to refactor
// async function addScore(req, res) {
//   try {
//     const query = {
//       _id: mongoose.Types.ObjectId(req.params.id)
//     };
//     const update = {
//       scores: req.body.score,
//     };
//     const result = await League.updateOne(query, update);
//     res.status(200).send(result);
//   } catch (e) {
//     responder({ res, status: 500, error: e });
//   }
// }

// GET /leagues
// - get multiple leagues
// Request body:
// {
//   "leagueIds": ["leagueId1", "leagueId2"]
// }
router.get('/', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    const leagues = await League.find({
      _id: {
        $in: req.body.leagueIds.map((el) => mongoose.Types.ObjectId(el))
      }
    });
    res.status(200).json(leagues);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger(e.stack);
    responder({ res, status: 500, error: e });
  }
});

// GET /leagues/:id
// - get a league
router.get('/:id', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    const league = await League.findById(req.params.id);
    res.status(200).json(league);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger(e.stack);
    responder({ res, status: 500, error: e });
  }
});


module.exports = router;
