const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  _id: String,
  name: String,
  pic: String,
  isDeleted: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('User', UserSchema);
