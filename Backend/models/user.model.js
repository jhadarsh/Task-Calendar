const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Stay Consistent",
    },
    text: {
      type: String,
      default: "Small steps every day lead to big achievements.",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  verified: {
    type: Boolean,
    default: false,
  },


  goals: {
    type: [String],
    default: [],
  },

  monthlyTasks: {
    type: [String],
    default: [],
  },

  quote: {
    type: quoteSchema,
    default: () => ({}),
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
