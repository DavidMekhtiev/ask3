const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  about: { type: String, required: true },
  password: { type: String, required: true },
  posts:[{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
  friends: [{ type : mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
