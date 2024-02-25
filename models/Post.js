const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  header: { type: String, required: true },
  about: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', userSchema);
