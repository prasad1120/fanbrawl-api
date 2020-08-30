const mongoose = require('mongoose');

const { Schema } = mongoose;

const GroupSchema = new Schema({
  name: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updates: [{
    _id: false,
    time: {
      type: Date,
      default: Date.now,
    },
    by: {
      type: String,
      ref: 'User',
    },
    action: String,
    users: {
      type: [String],
      ref: 'User',
    },
    name: String,
    leagueId: {
      type: Schema.Types.ObjectId,
      ref: 'League'
    }
  }],
  users: [{
    type: String,
    ref: 'User',
  }],
  createdBy: {
    type: String,
    ref: 'User'
  },
  leagues: [{
    type: Schema.Types.ObjectId,
    ref: 'League'
  }]
});

module.exports = mongoose.model('Group', GroupSchema);
