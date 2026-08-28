const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'membership_approved',
        'membership_rejected',
        'new_post',
        'new_comment',
        'new_event',
        'post_liked',
        'community_approved',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedCommunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
    },
    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    relatedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
