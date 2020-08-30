const mongoose = require('mongoose');

const { Schema } = mongoose;

const FixtureSchema = new Schema({
  t1: String,
  t2: String,
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: 'Tournament',
  },
});

FixtureSchema.index({ startTime: -1 });

module.exports = mongoose.model('Fixture', FixtureSchema);
