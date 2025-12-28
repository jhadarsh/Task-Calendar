const Task = require("../models/task.model");
// const { getRevisionDate } = require("../utils/revisionDates");

const { generateRepeatedDates } = require("../utils/schedule.util");
 

exports.createTask = async (req, res, next) => {
  try {
    const {
      subject,
      title,
      text,
      assignedDate,
      type,
      repeatEveryDays // ONLY for general
    } = req.body;

    // 1️⃣ Create base task
    const baseTask = await Task.create({
      user: req.user.id,
      subject,
      title,
      text,
      assignedDate,
      type,
      revisionStep: 0
    });

    let futureTasks = [];

    // 2️⃣ TYPE-BASED SCHEDULING
    if (type === "task") {
      // Classic spaced repetition
      const steps = [3, 6, 15];

      futureTasks = steps.map((days, index) => ({
        user: req.user.id,
        subject,
        title,
        text,
        type,
        assignedDate: new Date(
          new Date(assignedDate).setDate(
            new Date(assignedDate).getDate() + days
          )
        ),
        revisionStep: index + 1,
        parentTask: baseTask._id
      }));
    }

    if (type === "pyq") {
      const dates = generateRepeatedDates(assignedDate, 21);

      futureTasks = dates.map(d => ({
        user: req.user.id,
        subject,
        title,
        text,
        type,
        assignedDate: d.date,
        revisionStep: d.step,
        parentTask: baseTask._id
      }));
    }
    if (type === "fullrevision") {
      const dates = generateRepeatedDates(assignedDate, 20);

      futureTasks = dates.map(d => ({
        user: req.user.id,
        subject,
        title,
        text,
        type,
        assignedDate: d.date,
        revisionStep: d.step,
        parentTask: baseTask._id
      }));
    }

    if (type === "test" ) {
      const dates = generateRepeatedDates(assignedDate, 30);

      futureTasks = dates.map(d => ({
        user: req.user.id,
        subject,
        title,
        text,
        type,
        assignedDate: d.date,
        revisionStep: d.step,
        parentTask: baseTask._id
      }));
    }

    if (type === "general" && repeatEveryDays > 0) {
      const dates = generateRepeatedDates(assignedDate, repeatEveryDays);

      futureTasks = dates.map(d => ({
        user: req.user.id,
        subject,
        title,
        text,
        type,
        assignedDate: d.date,
        revisionStep: d.step,
        parentTask: baseTask._id
      }));
    }

    // 3️⃣ Bulk insert
    if (futureTasks.length) {
      await Task.insertMany(futureTasks);
    }

    res.status(201).json({
      success: true,
      message: "Task scheduled successfully",
      totalTasksCreated: 1 + futureTasks.length
    });

  } catch (err) {
    next(err);
  }
};

/* ---------- GET TASKS (CALENDAR) ---------- */
exports.getTasksByDateRange = async (req, res, next) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Start and end date are required"
      });
    }

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      user: req.user.id,
      assignedDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .sort({ assignedDate: 1 })
      .lean(); // faster, frontend-friendly

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (err) {
    next(err);
  }
};


// ============================================
// TASK CONTROLLER - Enhanced with Buffer Logic
// ============================================

// Get today's tasks
exports.getTodayTasks = async (req, res, next) => {
  try {
    const { date } = req.query;

    // 🔑 Decide "today"
    const baseDate = date ? new Date(date) : new Date();

    if (isNaN(baseDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const todayStart = new Date(baseDate);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(baseDate);
    todayEnd.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      user: req.user.id,
      assignedDate: { $gte: todayStart, $lte: todayEnd },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      dateUsed: todayStart.toISOString().split("T")[0],
      tasks,
    });
  } catch (err) {
    next(err);
  }
};


// Get buffer tasks (missed tasks not completed)
exports.getBufferTasks = async (req, res, next) => {
  try {
    const { date } = req.query;

    // 🔑 Decide "today" (real or manual)
    const baseDate = date ? new Date(date) : new Date();

    if (isNaN(baseDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const todayStart = new Date(baseDate);
    todayStart.setHours(0, 0, 0, 0);

    // Get all tasks that are:
    // 1. Before selected date
    // 2. Not completed
    const bufferTasks = await Task.find({
      user: req.user.id,
      assignedDate: { $lt: todayStart },
      status: { $ne: "completed" },
    }).sort({ assignedDate: 1 }); // Oldest first

    res.json({
      success: true,
      dateUsed: todayStart.toISOString().split("T")[0],
      tasks: bufferTasks,
    });
  } catch (err) {
    next(err);
  }
};


// Update task status
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: "Task not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Task updated", 
      task 
    });
  } catch (err) {
    next(err);
  }
};

// Reschedule single task
exports.rescheduleTask = async (req, res, next) => {
  try {
    const { newDate } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        assignedDate: new Date(newDate),
        status: "pending",
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: "Task not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Task rescheduled", 
      task 
    });
  } catch (err) {
    next(err);
  }
};

// Reschedule all occurrences (parent + children)
exports.rescheduleAllOccurrences = async (req, res, next) => {
  try {
    const { newDate, repeatEveryDays } = req.body;
    const taskId = req.params.id;

    // Find the current task
    const currentTask = await Task.findById(taskId);
    
    if (!currentTask) {
      return res.status(404).json({ 
        success: false, 
        message: "Task not found" 
      });
    }

    // Determine the parent task ID
    const parentId = currentTask.parentTask || currentTask._id;

    // Delete all future occurrences (including parent if it's in the future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Task.deleteMany({
      $or: [
        { _id: parentId, assignedDate: { $gte: today } },
        { parentTask: parentId, assignedDate: { $gte: today } }
      ],
      user: req.user.id
    });

    // Get parent task data (might have been deleted, so use currentTask data)
    const baseData = {
      user: req.user.id,
      subject: currentTask.subject,
      title: currentTask.title,
      text: currentTask.text,
      type: currentTask.type
    };

    // Create new base task
    const baseTask = await Task.create({
      ...baseData,
      assignedDate: new Date(newDate),
      revisionStep: 0,
      status: "pending"
    });

    let futureTasks = [];

    // Generate new schedule based on type
    if (currentTask.type === "task") {
      const steps = [3, 6, 15];
      futureTasks = steps.map((days, index) => ({
        ...baseData,
        assignedDate: new Date(
          new Date(newDate).setDate(new Date(newDate).getDate() + days)
        ),
        revisionStep: index + 1,
        parentTask: baseTask._id,
        status: "pending"
      }));
    }

    if (currentTask.type === "pyq") {
      const dates = generateRepeatedDates(newDate, 21);
      futureTasks = dates.map(d => ({
        ...baseData,
        assignedDate: d.date,
        revisionStep: d.step,
        parentTask: baseTask._id,
        status: "pending"
      }));
    }

    if (currentTask.type === "fullrevision") {
      const dates = generateRepeatedDates(newDate, 20);
      futureTasks = dates.map(d => ({
        ...baseData,
        assignedDate: d.date,
        revisionStep: d.step,
        parentTask: baseTask._id,
        status: "pending"
      }));
    }

    if (currentTask.type === "test") {
      const dates = generateRepeatedDates(newDate, 30);
      futureTasks = dates.map(d => ({
        ...baseData,
        assignedDate: d.date,
        revisionStep: d.step,
        parentTask: baseTask._id,
        status: "pending"
      }));
    }

    if (currentTask.type === "general" && repeatEveryDays > 0) {
      const dates = generateRepeatedDates(newDate, repeatEveryDays);
      futureTasks = dates.map(d => ({
        ...baseData,
        assignedDate: d.date,
        revisionStep: d.step,
        parentTask: baseTask._id,
        status: "pending"
      }));
    }

    // Insert future tasks
    if (futureTasks.length) {
      await Task.insertMany(futureTasks);
    }

    res.json({
      success: true,
      message: "All occurrences rescheduled",
      totalTasksCreated: 1 + futureTasks.length
    });
  } catch (err) {
    next(err);
  }
};

// Delete buffer task (only if older than threshold)
exports.deleteBufferTask = async (req, res, next) => {
  try {
    const { bufferThreshold = 5, date } = req.query;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // 🔑 Decide "today" (real or manual)
    const baseDate = date ? new Date(date) : new Date();

    if (isNaN(baseDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const today = new Date(baseDate);
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(task.assignedDate);
    taskDate.setHours(0, 0, 0, 0);

    const daysDifference = Math.floor(
      (today - taskDate) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference < Number(bufferThreshold)) {
      return res.status(400).json({
        success: false,
        message: `Task can only be deleted after ${bufferThreshold} days`,
      });
    }

    await Task.findByIdAndDelete(taskId);

    res.json({
      success: true,
      message: "Task deleted from buffer",
      dateUsed: today.toISOString().split("T")[0],
    });
  } catch (err) {
    next(err);
  }
};


// Update task type and repetition
exports.updateTaskTypeAndRepetition = async (req, res, next) => {
  try {
    const { type, repeatEveryDays, rescheduleAll } = req.body;
    const taskId = req.params.id;

    const currentTask = await Task.findById(taskId);
    
    if (!currentTask) {
      return res.status(404).json({ 
        success: false, 
        message: "Task not found" 
      });
    }

    if (rescheduleAll) {
      // Update all future occurrences
      const parentId = currentTask.parentTask || currentTask._id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Delete old future tasks
      await Task.deleteMany({
        parentTask: parentId,
        assignedDate: { $gt: today },
        user: req.user.id
      });

      // Update current task type
      currentTask.type = type;
      await currentTask.save();

      // Generate new schedule
      let futureTasks = [];
      const baseData = {
        user: req.user.id,
        subject: currentTask.subject,
        title: currentTask.title,
        text: currentTask.text,
        type
      };

      const startDate = currentTask.assignedDate;

      if (type === "task") {
        const steps = [3, 6, 15];
        futureTasks = steps.map((days, index) => ({
          ...baseData,
          assignedDate: new Date(
            new Date(startDate).setDate(new Date(startDate).getDate() + days)
          ),
          revisionStep: index + 1,
          parentTask: parentId,
          status: "pending"
        }));
      } else if (type === "pyq") {
        const dates = generateRepeatedDates(startDate, 21);
        futureTasks = dates.map(d => ({
          ...baseData,
          assignedDate: d.date,
          revisionStep: d.step,
          parentTask: parentId,
          status: "pending"
        }));
      } else if (type === "fullrevision") {
        const dates = generateRepeatedDates(startDate, 20);
        futureTasks = dates.map(d => ({
          ...baseData,
          assignedDate: d.date,
          revisionStep: d.step,
          parentTask: parentId,
          status: "pending"
        }));
      } else if (type === "test") {
        const dates = generateRepeatedDates(startDate, 30);
        futureTasks = dates.map(d => ({
          ...baseData,
          assignedDate: d.date,
          revisionStep: d.step,
          parentTask: parentId,
          status: "pending"
        }));
      } else if (type === "general" && repeatEveryDays > 0) {
        const dates = generateRepeatedDates(startDate, repeatEveryDays);
        futureTasks = dates.map(d => ({
          ...baseData,
          assignedDate: d.date,
          revisionStep: d.step,
          parentTask: parentId,
          status: "pending"
        }));
      }

      if (futureTasks.length) {
        await Task.insertMany(futureTasks);
      }

      res.json({
        success: true,
        message: "Task type and schedule updated for all occurrences",
        totalTasksCreated: futureTasks.length
      });
    } else {
      // Update only this task
      currentTask.type = type;
      await currentTask.save();

      res.json({
        success: true,
        message: "Task type updated",
        task: currentTask
      });
    }
  } catch (err) {
    next(err);
  }
};

// Helper function - generateRepeatedDates
// function generateRepeatedDates(startDate, intervalDays) {
//   const dates = [];
//   const start = new Date(startDate);
  
//   for (let i = 1; i <= 10; i++) { // Generate 10 repetitions
//     const nextDate = new Date(start);
//     nextDate.setDate(start.getDate() + (intervalDays * i));
//     dates.push({
//       date: nextDate,
//       step: i
//     });
//   }
  
//   return dates;
// }

exports.getAvailableDates = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const freeDays = [];
    const lightDays = [];

    for (let i = 1; i < 60; i++) {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() + i);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await Task.countDocuments({
        user: req.user.id,
        assignedDate: { $gte: dayStart, $lte: dayEnd },
      });

      const dateKey = `${dayStart.getFullYear()}-${String(
        dayStart.getMonth() + 1
      ).padStart(2, "0")}-${String(dayStart.getDate()).padStart(2, "0")}`;

      // ✅ EXACTLY ZERO TASK DAYS (FREE DAYS)
      if (count === 0 && freeDays.length < 3) {
        freeDays.push({
          key: dateKey,
          display: dayStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          count,
        });
      }

      // ✅ LIGHT LOAD DAYS (OPTIONAL)
      if (count > 0 && count < 3 && lightDays.length < 5) {
        lightDays.push({
          key: dateKey,
          display: dayStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          count,
        });
      }

      // 🛑 Stop early if goals reached
      if (freeDays.length >= 3 && lightDays.length >= 5) break;
    }

    res.json({
      success: true,
      freeDays,
      lightDays,
    });
  } catch (err) {
    next(err);
  }
};

exports.getTaskPerformance = async (req, res, next) => {
  try {
    const now = new Date();

    // Start of previous month
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // End of current month
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const tasks = await Task.find({
      user: req.user.id,
      assignedDate: { $gte: start, $lte: end },
    });

    const stats = {
      thisMonth: { total: 0, completed: 0, pending: 0, missed: 0 },
      lastMonth: { total: 0, completed: 0, pending: 0, missed: 0 },
    };

    tasks.forEach((task) => {
      const taskMonth = task.assignedDate.getMonth();
      const currentMonth = now.getMonth();
      const target =
        taskMonth === currentMonth ? "thisMonth" : "lastMonth";

      stats[target].total++;

      if (task.status === "completed") stats[target].completed++;
      if (task.status === "pending") stats[target].pending++;
      if (task.status === "missed") stats[target].missed++;
    });

    res.json({
      success: true,
      stats,
    });
  } catch (err) {
    next(err);
  }
};


