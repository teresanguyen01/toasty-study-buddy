import mongoose from "mongoose";

const deckSchema = new mongoose.Schema({
  ownerId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  visibility: {
    type: String,
    enum: ["private", "friends", "public"],
    default: "private",
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  cardCount: {
    type: Number,
    default: 0,
  },
  lastStudied: {
    type: Date,
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

deckSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Deck || mongoose.model("Deck", deckSchema);
