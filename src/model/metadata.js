const mongoose = require('mongoose');

const { Schema } = mongoose;

const MetadataSchema = new Schema({
  tournamentsLastModified: Date,
});

module.exports = mongoose.model('Metadata', MetadataSchema);
