const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    place: {
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    description: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    memberCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rules: {
      type: String,
      maxlength: 2000,
      default: '',
    },
  },
  { timestamps: true }
);

communitySchema.index({ 'place.city': 1, 'place.state': 1 });

module.exports = mongoose.model('Community', communitySchema);