
const Joi = require('@hapi/joi');

const Constraints = {
  teamName: Joi.string()
    .min(1)
    .max(25)
    .required(),
  groupName: Joi.string()
    .min(1)
    .max(25)
    .required(),
  usersArray: Joi.array()
    .max(50)
    .min(1)
    .required()
    .unique(),
  startTime: Joi.date()
    .required()
    .iso(),
  endTime: Joi.date()
    .required()
    .iso()
    .min(Joi.ref('startTime')),
  fixture() {
    return {
      t1: this.teamName,
      t2: this.teamName,
      startTime: this.startTime,
      endTime: this.endTime,
      tournamentId: Joi.string()
    };
  }
};

module.exports = Constraints;
