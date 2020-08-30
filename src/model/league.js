const mongoose = require('mongoose');

const { Schema } = mongoose;

const LeagueSchema = new Schema({
  name: String,
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: 'Tournament',
  },
  fixtureId: {
    type: Schema.Types.ObjectId,
    ref: 'Fixture'
  },
  scores: [Schema.Types.Mixed],
  topper: {
    type: String,
    ref: 'User',
  },
  users: [{
    type: String,
    ref: 'User',
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});
const leagueModel = mongoose.model('League', LeagueSchema);

// LeagueSchema.post('updateOne', async () => {
//     //this.update({},{ $set: { updatedAt: new Date() } });
//     let league = await leagueModel.findById(this._conditions._id);

//     console.log(this._conditions._id);
// });

module.exports = leagueModel;


/*
Scores Schema

scores: [{
    "fixtureId": {
        "userId": score,
        topper: userId
    }
}]
*/
