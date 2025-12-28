const User = require("../models/user.model");

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};


exports.updateQuote = async (req, res, next) => {
  try {
    const { title, text } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        quote: {
          title: title ?? "Stay Consistent",
          text:
            text ?? "Small steps every day lead to big achievements.",
        },
      },
      { new: true }
    ).select("-password");

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.addGoal = async (req, res, next) => {
  try {
    const { goal } = req.body;

    if (!goal?.trim()) {
      return res.status(400).json({ message: "Goal is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { goals: goal.trim() } },
      { new: true }
    ).select("-password");

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const { goal } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { goals: goal } },
      { new: true }
    ).select("-password");

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.addMonthlyTask = async (req, res, next) => {
  try {
    const { task } = req.body;

    if (!task?.trim()) {
      return res.status(400).json({ message: "Task is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { monthlyTasks: task.trim() } },
      { new: true }
    ).select("-password");

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.deleteMonthlyTask = async (req, res, next) => {
  try {
    const { task } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { monthlyTasks: task } },
      { new: true }
    ).select("-password");

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
