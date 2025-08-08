import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  deckId: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  sm2: {
    easeFactor: {
      type: Number,
      default: 2.5,
      min: 1.3,
    },
    interval: {
      type: Number,
      default: 0,
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    nextReview: {
      type: Date,
      default: Date.now,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cardSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient querying of due cards
cardSchema.index({ "sm2.nextReview": 1 });
cardSchema.index({ deckId: 1 });

export default mongoose.models.Card || mongoose.model("Card", cardSchema);
