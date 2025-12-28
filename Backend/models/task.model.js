const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  title: {
    type: String,
    required: true
  },

  text: {
    type: String
  },

  assignedDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "completed", "missed"],
    default: "pending"
  },

  type: {
    type: String,
    enum: ["task", "pyq", "test", "fullrevision", "general"],
    required: true
  },
revisionStep: {
  type: Number,
  default: 0
},

parentTask: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Task",
  default: null
},

createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Task", taskSchema);
