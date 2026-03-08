const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const FoodPostSchema = new mongoose.Schema({
  item: { type: String, required: true },
  location: {
    name: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number }
  },
  postedAt: { type: Date, default: Date.now },
  timeTill: { type: Date, required: true },
  votes: { type: Number, default: 0 },
  goneVotes: { type: Number, default: 0 },
  photoUrl: { type: String },
  status: { type: String, enum: ['active', 'gone', 'deleted'], default: 'active' },
  comments: [CommentSchema]
});

module.exports = mongoose.model('FoodPost', FoodPostSchema);
