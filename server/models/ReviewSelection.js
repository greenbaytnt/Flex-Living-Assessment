const mongoose = require('mongoose');

const reviewSelectionSchema = new mongoose.Schema({
  review_id: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true,
    enum: ['hostaway', 'google', 'mock']
  },
  listing_id: {
    type: String,
    default: null
  },
  listing_name: {
    type: String,
    default: null
  },
  approved: {
    type: Boolean,
    default: false
  },
  display_on_website: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

reviewSelectionSchema.index({ review_id: 1, source: 1 }, { unique: true });

const ReviewSelection = mongoose.model('ReviewSelection', reviewSelectionSchema);

module.exports = ReviewSelection;

