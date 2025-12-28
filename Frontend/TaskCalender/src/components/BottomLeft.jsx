import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "../service/api"; // Adjust path

export default function BottomLeft() {
  const [selectedDate] = useState(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [rescheduleAll, setRescheduleAll] = useState(false);

  const [tasks, setTasks] = useState({});
  const [bufferTasks, setBufferTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasTest, setHasTest] = useState(false);
  const [hasPYQ, setHasPYQ] = useState(false);
  const [bufferThreshold] = useState(1); // Days threshold for delete button
  const [testTodayDate, setTestTodayDate] = useState(null);


const getEffectiveToday = () => {
  const base = testTodayDate ? new Date(testTodayDate) : new Date();
  base.setHours(0, 0, 0, 0);
  return base;
};



  // Fetch today's tasks
  const fetchTodayTasks = async () => {
    try {
      const response = await apiRequest("/tasks/today", "GET");

      if (response.success) {
        // Group tasks by subject
        const groupedTasks = {};
        let hasTestTask = false;
        let hasPYQTask = false;

        response.tasks.forEach((task) => {
          // Check for test and PYQ
          if (task.type === "test") hasTestTask = true;
          if (task.type === "pyq") hasPYQTask = true;

          // Group by subject
          if (!groupedTasks[task.subject]) {
            groupedTasks[task.subject] = [];
          }
          groupedTasks[task.subject].push({
            ...task,
            completed: task.status === "completed",
          });
        });

        setTasks(groupedTasks);
        setHasTest(hasTestTask);
        setHasPYQ(hasPYQTask);
      }
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
    }
  };

  // Fetch buffer tasks
  const fetchBufferTasks = async () => {
    try {
      // /tasks/buffer?date=2025-12-31
      const response = await apiRequest("/tasks/buffer", "GET");

      if (response.success) {
        setBufferTasks(
          response.tasks.map((task) => ({
            ...task,
            completed: task.status === "completed",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching buffer tasks:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTodayTasks(), fetchBufferTasks()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Toggle task completion (local state only)
  const toggleTaskComplete = (subject, taskId) => {
    setTasks((prev) => ({
      ...prev,
      [subject]: prev[subject].map((task) =>
        task._id === taskId ? { ...task, completed: !task.completed } : task
      ),
    }));
  };

  // Toggle buffer task completion (local state only)
  const toggleBufferTaskComplete = (taskId) => {
    setBufferTasks((prev) =>
      prev.map((task) =>
        task._id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Handle reschedule button click
  const handleReschedule = (subject, task) => {
    setSelectedTask({ subject, task });
    setShowRescheduleModal(true);
    setRescheduleAll(false);
  };

  // Confirm reschedule
  const confirmReschedule = async () => {
    if (!newDate) return;

    try {
      const endpoint = rescheduleAll
        ? `/tasks/${selectedTask.task._id}/reschedule-all`
        : `/tasks/${selectedTask.task._id}/reschedule`;

      const body = rescheduleAll
        ? {
            newDate,
            repeatEveryDays:
              selectedTask.task.type === "general" ? 7 : undefined,
          }
        : { newDate };

      const response = await apiRequest(endpoint, "PATCH", body);

      if (response.success) {
        // Refresh data
        await Promise.all([fetchTodayTasks(), fetchBufferTasks()]);

        setShowRescheduleModal(false);
        setNewDate("");
        setSelectedTask(null);
        setRescheduleAll(false);
      }
    } catch (error) {
      console.error("Error rescheduling task:", error);
      alert(error.message || "Failed to reschedule task");
    }
  };

  // Mark as complete - update all toggled tasks
  const markAsComplete = async () => {
    try {
      const updatePromises = [];

      // Update completed regular tasks
      Object.keys(tasks).forEach((subject) => {
        tasks[subject].forEach((task) => {
          if (task.completed && task.status !== "completed") {
            updatePromises.push(
              apiRequest(`/tasks/${task._id}/status`, "PATCH", {
                status: "completed",
              })
            );
          }
        });
      });

      // Update completed buffer tasks
      bufferTasks.forEach((task) => {
        if (task.completed && task.status !== "completed") {
          updatePromises.push(
            apiRequest(`/tasks/${task._id}/status`, "PATCH", {
              status: "completed",
            })
          );
        }
      });

      await Promise.all(updatePromises);

      // Refresh data after updating
      await Promise.all([fetchTodayTasks(), fetchBufferTasks()]);

      console.log("✅ Tasks marked as complete successfully!");
    } catch (error) {
      console.error("Error marking tasks as complete:", error);
      alert("Failed to update some tasks");
    }
  };

  // Delete buffer task
const deleteBufferTask = async (taskId, assignedDate) => {
  const today = getEffectiveToday();

  const taskDate = new Date(assignedDate);
  taskDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (today - taskDate) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff < bufferThreshold) {
    alert(`Task can only be deleted after ${bufferThreshold} days`);
    return;
  }

  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    const query = testTodayDate
      ? `?bufferThreshold=${bufferThreshold}&date=${testTodayDate}`
      : `?bufferThreshold=${bufferThreshold}`;

    const response = await apiRequest(
      `/tasks/${taskId}/buffer${query}`,
      "DELETE"
    );

    if (response.success) {
      await fetchBufferTasks();
    }
  } catch (error) {
    console.error("Error deleting buffer task:", error);
    alert(error.message || "Failed to delete task");
  }
};


  // Calculate days old for buffer tasks
const getDaysOld = (assignedDate) => {
  const today = getEffectiveToday();

  const taskDate = new Date(assignedDate);
  taskDate.setHours(0, 0, 0, 0);

  return Math.floor(
    (today - taskDate) / (1000 * 60 * 60 * 24)
  );
};
useEffect(() => {
  // ONLY for testing — remove later
  setTestTodayDate(null);
}, []);


  if (loading) {
    return (
      <div className="h-[80vh] w-full bg-background border-2 border-secondary rounded-lg p-3 sm:p-4 flex items-center justify-center">
        <p className="font-kodchasan text-primary text-sm">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="
  min-h-[50vh] 
  sm:min-h-[70vh] 
  md:min-h-[80vh] 
  w-full bg-background border-2 border-secondary 
  rounded-lg p-3 sm:p-4 flex flex-col overflow-hidden
">  {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-shrink-0">
        {/* Selected Date */}
        <div className="min-w-0 flex-1">
          <h2 className="font-kodchasan text-primary text-sm sm:text-base md:text-lg font-semibold truncate">
            {selectedDate}
          </h2>
        </div>

        {/* Status Dots */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* TEST DOT */}
          {hasTest && (
            <div className="relative group">
              <span className="block w-2.5 h-2.5 rounded-full bg-secondary" />
              {/* Tooltip */}
              <span
                className="absolute -top-6 left-1/2 -translate-x-1/2
                         px-2 py-0.5 text-[10px] font-semibold
                         text-white bg-secondary rounded
                         opacity-0 group-hover:opacity-100
                         transition-opacity whitespace-nowrap
                         hidden md:block"
              >
                Test
              </span>
            </div>
          )}

          {/* PYQ DOT */}
          {hasPYQ && (
            <div className="relative group">
              <span className="block w-2.5 h-2.5 rounded-full bg-green-500" />
              {/* Tooltip */}
              <span
                className="absolute -top-6 left-1/2 -translate-x-1/2
                         px-2 py-0.5 text-[10px] font-semibold
                         text-white bg-green-600 rounded
                         opacity-0 group-hover:opacity-100
                         transition-opacity whitespace-nowrap
                         hidden md:block"
              >
                PYQ
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-auto space-y-3 sm:space-y-4 mb-3 pr-1 min-h-0">
        {/* Regular Tasks by Subject */}
        {Object.keys(tasks).length === 0 ? (
          <div className="text-center py-8">
            <p className="font-kodchasan text-primary/60 text-sm">
              No tasks scheduled for today
            </p>
          </div>
        ) : (
          Object.keys(tasks).map((subject) => (
            <motion.div
              key={subject}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background border-2 border-accent1 rounded-lg p-2 sm:p-3 w-full min-w-72"
            >
              <h3 className="font-kodchasan text-primary font-bold text-xs sm:text-sm md:text-base mb-2">
                {subject}
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                {tasks[subject].map((task) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 group relative w-full min-w-62"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskComplete(subject, task._id)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 cursor-pointer accent-secondary"
                    />
                    <div className="flex-1 relative group/tooltip">
                      <p
                        className={`font-kodchasan text-xs sm:text-sm whitespace-nowrap ${
                          task.completed
                            ? "line-through text-primary/50"
                            : "text-primary"
                        }`}
                      >
                        {task.title}
                      </p>
                      {/* Tooltip */}
                      <div
                        className="absolute left-0 top-full mt-1
                bg-primary text-background
                px-2 py-1.5 rounded-lg
                text-xs font-kodchasan
                opacity-0 invisible
                group-hover/tooltip:opacity-100
                group-hover/tooltip:visible
                transition-all duration-200
                z-[9999]
                w-48 sm:w-64
                shadow-lg whitespace-normal"
                      >
                        {task.text}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReschedule(subject, task)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-accent2 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-kodchasan font-semibold flex-shrink-0"
                    >
                      Shift
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}

        {/* Buffer Section */}
        {bufferTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background border-2 border-accent2 rounded-lg p-2 sm:p-3 w-full sm:w-72"
          >
            <h3 className="font-kodchasan text-primary font-bold text-xs sm:text-sm md:text-base mb-1">
              Buffer Tasks
            </h3>
            <p className="font-kodchasan text-primary/60 text-[10px] sm:text-xs mb-2">
              Missed & Rescheduled Tasks
            </p>
            <div className="space-y-1.5 sm:space-y-2">
              {bufferTasks.map((task) => {
                const daysOld = getDaysOld(task.assignedDate);
                const canDelete = daysOld >= bufferThreshold;

                return (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 relative min-w-64 group"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleBufferTaskComplete(task._id)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 cursor-pointer accent-accent2"
                    />
                    <div className="flex-1 relative group/tooltip">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className="font-kodchasan text-[10px] sm:text-xs text-accent2 font-semibold flex-shrink-0">
                          [{task.subject}]
                        </span>
                        <p
                          className={`font-kodchasan text-xs sm:text-sm whitespace-nowrap ${
                            task.completed
                              ? "line-through text-primary/50"
                              : "text-primary"
                          }`}
                        >
                          {task.title}
                        </p>
                      </div>
                      {/* Tooltip */}
                      <div className="absolute left-0 top-full mt-1 bg-primary text-background px-2 py-1.5 rounded-lg text-xs font-kodchasan opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 w-48 sm:w-64 shadow-lg whitespace-normal">
                        {task.text}
                      </div>
                    </div>

                    {/* Delete button - only show if old enough */}
                    {canDelete && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          deleteBufferTask(task._id, task.assignedDate)
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-kodchasan font-semibold flex-shrink-0"
                        title={`${daysOld} days old`}
                      >
                        Delete
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Mark as Complete Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={markAsComplete}
        className="w-full bg-secondary text-background py-2 sm:py-2.5 rounded-lg font-kodchasan font-bold text-sm sm:text-base flex-shrink-0"
      >
        Mark as Complete
      </motion.button>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRescheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-background border-2 border-accent2 rounded-lg p-4 sm:p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-kodchasan text-primary text-base sm:text-lg font-bold mb-3">
                Reschedule Task
              </h3>
              <div className="bg-accent2/10 border border-accent2 rounded-lg p-3 mb-4">
                <p className="font-kodchasan text-xs text-accent2 font-semibold mb-1">
                  {selectedTask.subject}
                </p>
                <p className="font-kodchasan text-xs sm:text-sm font-semibold text-primary mb-1">
                  {selectedTask.task.title}
                </p>
                <p className="font-kodchasan text-xs text-primary/70 mb-2">
                  {selectedTask.task.text}
                </p>
                <p className="font-kodchasan text-[10px] text-primary/50">
                  Type:{" "}
                  <span className="font-semibold">
                    {selectedTask.task.type}
                  </span>
                </p>
              </div>

              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full border-2 border-accent1 rounded-lg px-3 py-2 font-kodchasan text-primary mb-3 focus:outline-none focus:border-accent2 text-sm bg-background"
              />

              {/* Reschedule all occurrences option */}
              <div className="flex items-center gap-2 mb-4 bg-accent1/10 p-2 rounded-lg">
                <input
                  type="checkbox"
                  id="rescheduleAll"
                  checked={rescheduleAll}
                  onChange={(e) => setRescheduleAll(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-accent2"
                />
                <label
                  htmlFor="rescheduleAll"
                  className="font-kodchasan text-xs text-primary cursor-pointer"
                >
                  Reschedule all future occurrences
                </label>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmReschedule}
                  disabled={!newDate}
                  className="flex-1 bg-accent2 text-primary py-2 rounded-lg font-kodchasan font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 bg-accent1 text-primary py-2 rounded-lg font-kodchasan font-semibold text-sm"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
