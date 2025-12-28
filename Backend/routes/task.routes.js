const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasksByDateRange,
  getTodayTasks,
  getBufferTasks,
  updateTaskStatus,
  rescheduleTask,
  rescheduleAllOccurrences,
  deleteBufferTask,
  updateTaskTypeAndRepetition,
  getTaskPerformance,
  getAvailableDates
} = require("../controllers/task.controller");

const { isAuthenticated } = require("../middlewares/auth.middleware");

router.post("/", isAuthenticated, createTask);
router.get("/", isAuthenticated, getTasksByDateRange);
router.get("/today", isAuthenticated, getTodayTasks);
router.get("/buffer", isAuthenticated, getBufferTasks);
router.patch("/:id/status", isAuthenticated, updateTaskStatus);
router.patch("/:id/reschedule", isAuthenticated, rescheduleTask);
router.patch("/:id/reschedule-all", isAuthenticated, rescheduleAllOccurrences);
router.patch("/:id/update-type", isAuthenticated, updateTaskTypeAndRepetition);
router.delete("/:id/buffer", isAuthenticated, deleteBufferTask);
router.get("/available-dates", isAuthenticated, getAvailableDates);
router.get("/performance", isAuthenticated, getTaskPerformance);


module.exports = router; 
