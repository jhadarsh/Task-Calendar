const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateQuote,
  addGoal,
  deleteGoal,
  addMonthlyTask,
  deleteMonthlyTask,
} = require("../controllers/user.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");

router.get("/me", isAuthenticated, getUserProfile);

// Quote
router.put("/quote", isAuthenticated, updateQuote);

// Goals
router.post("/goals", isAuthenticated, addGoal);
router.delete("/goals/:goal", isAuthenticated, deleteGoal);

// Monthly Tasks
router.post("/monthly-tasks", isAuthenticated, addMonthlyTask);
router.delete("/monthly-tasks/:task", isAuthenticated, deleteMonthlyTask);

module.exports = router;
