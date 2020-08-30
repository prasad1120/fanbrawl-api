const mongoose = require('mongoose');

const { Schema } = mongoose;

const TournamentSchema = new Schema({
  name: String,
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  fixtures: [{
    type: Schema.Types.ObjectId,
    ref: 'Fixture',
  }],
});

TournamentSchema.index({ startTime: -1 });

module.exports = mongoose.model('Tournament', TournamentSchema);
