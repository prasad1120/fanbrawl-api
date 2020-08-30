const express = require('express');
const mongoose = require('mongoose');
const Group = require('../model/group.js');
const League = require('../model/league.js');
const Tournament = require('../model/tournament.js');
const Fixture = require('../model/fixture.js');
const middleware = require('../middleware/group.js');
const responder = require('../utils/responder.js');
const logger = require('../utils/logger.js');
const CustomError = require('../utils/CustomError.js');

const router = express.Router();

router.use(middleware);

// GET /groups
// - get groups by groupIds
// Request body:
// {
//   "groupIds": ["groupId1", "groupId2"]
// }
router.get('/', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    const groups = await Group.find({
      _id: {
        $in: req.body.groupIds.map((el) => mongoose.Types.ObjectId(el))
      }
    });
    res.json(groups);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});


// POST /groups
// - post a group with multiple users
// Request body:
// {
//   "name": "Group name"
//   "users": ["user1@g.com", "user2@g.com"]
// }
router.post('/', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    req.body.users.unshift(res.locals.user.id);
    const group = new Group({
      name: req.body.name,
      createdBy: res.locals.user.id,
      users: req.body.users,
      updates: [{
        time: Date.now(),
        by: res.locals.user.id,
        action: 'CREATE_GROUP_AND_ADD_USERS',
        users: req.body.users,
        name: req.body.name
      }],
      leagues: []
    });
    const groupDoc = await group.save();

    res.status(200).json(groupDoc);
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});


// POST /groups/:id/leagues
// - post a league
// Request body:
// {
//   "users": ["user1@g.com", "user2@g.com"],
//   "tournamentId": "_tournamentId" OR "fixtureId": "_fixtureId"
// }
router.post('/:id/leagues', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    let league;
    const leagueId = mongoose.Types.ObjectId();
    if (req.body.tournamentId) {
      const tournamentId = mongoose.Types.ObjectId(req.body.tournamentId);
      const { name } = await Tournament.findById(tournamentId, 'name');
      league = new League({
        _id: leagueId,
        name,
        tournamentId,
        users: req.body.users,
        scores: [],
        topper: null,
      });
    } else if (req.body.fixtureId) {
      const fixtureId = mongoose.Types.ObjectId(req.body.fixtureId);
      const fixture = await Fixture.findById(fixtureId);
      league = new League({
        _id: leagueId,
        name: `${fixture.t1} vs ${fixture.t2}`,
        fixtureId,
        users: req.body.users,
        scores: [],
        topper: null,
      });
    } else {
      throw CustomError('InvalidParameters');
    }

    const updateResult = await Group.updateOne({
      _id: mongoose.Types.ObjectId(req.params.id),
      isActive: true
    },
    {
      $set: {
        updatedAt: Date.now()
      },
      $push: {
        leagues: leagueId,
        updates: {
          $each: [{
            by: res.locals.user.id,
            action: 'ADD_LEAGUE',
            users: req.body.users,
            leagueId,
          }],
          $slice: -5,
        },
      }
    });
    if (updateResult.nModified === 1) {
      const leagueDoc = await league.save();
      res.status(200).json(leagueDoc);
    } else {
      throw CustomError('LeagueCreationFailure', JSON.stringify(updateResult));
    }
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});


// PUT /groups/:id/add-users
// Request body:
// {
//  "users": ["user1@g.com", "user2@g.com"]
// }
router.put('/:id/add-users', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    const updateResult = await Group.updateOne({
      _id: mongoose.Types.ObjectId(req.params.id),
      isActive: true
    },
    {
      $set: {
        updatedAt: Date.now()
      },
      $addToSet: {
        users: {
          $each: req.body.users
        }
      },
      $push: {
        updates: {
          $each: [{
            by: res.locals.user.id,
            action: 'ADD_USERS',
            users: req.body.users,
          }],
          $slice: -5,
        },
      },
    });

    if (updateResult.nModified === 1) {
      res.status(200).json({ message: 'Users successfully added' });
    } else {
      throw CustomError('UsersAdditionFailure', JSON.stringify(updateResult));
    }

    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});


// PUT /groups/:id/change-name
// Request body:
// {
//   "name": "Group name"
// }
router.put('/:id/change-name', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);

    const updateResult = await Group.updateOne({
      _id: mongoose.Types.ObjectId(req.params.id),
      isActive: true
    },
    {
      $set: {
        updatedAt: Date.now(),
        name: req.body.name
      },
      $push: {
        updates: {
          $each: [{
            by: res.locals.user.id,
            action: 'CHANGE_NAME',
            name: req.body.name,
          }],
          $slice: -5,
        },
      },
    });

    if (updateResult.nModified === 1) {
      res.status(200).json({ message: 'Group name changed successfully!' });
    } else {
      throw CustomError('ChangeGroupNameFailure', JSON.stringify(updateResult));
    }

    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});


// PUT /groups/:id/remove-users
// Request body:
// {
//   "users": ["user1@g.com", "user2@g.com"]
// }
router.put('/:id/remove-users', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);

    const updateResult = await Group.updateOne({
      _id: mongoose.Types.ObjectId(req.params.id),
      isActive: true
    },
    {
      $set: {
        updatedAt: Date.now()
      },
      $pull: {
        users: {
          $in: req.body.users,
        }
      },
      $push: {
        updates: {
          $each: [{
            by: res.locals.user.id,
            action: 'REMOVE_USER',
            users: req.body.users,
          }],
          $slice: -5,
        },
      },
    });

    if (updateResult.nModified === 1) {
      res.status(200).json({ message: 'User sucessfully removed' });
    } else {
      throw CustomError('ChangeGroupNameFailure', JSON.stringify(updateResult));
    }

    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});


// DELETE /groups/:id
router.delete('/:id', async (req, res) => {
  try {
    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request received.`);
    const updateResult = await Group.updateOne({
      _id: mongoose.Types.ObjectId(req.params.id),
      isActive: true
    }, {
      $set: {
        isActive: false
      },
      $push: {
        updates: {
          $each: [{
            by: res.locals.user.id,
            action: 'DELETE_GROUP'
          }],
          $slice: -5,
        },
      },
    });

    if (updateResult.nModified === 1) {
      res.status(200).json({ message: 'Group sucessfully deleted' });
    } else {
      throw CustomError('DeleteGroupFailure', JSON.stringify(updateResult));
    }

    logger.info(`${req.method}.${req.originalUrl.substring(1)}.${res.locals.user.id}: Request served.`);
  } catch (e) {
    logger.error(e.stack);
    responder({ res, status: 500, error: e });
  }
});

module.exports = router;
