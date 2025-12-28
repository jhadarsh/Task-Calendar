import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "../service/api";

export default function BottomRight() {
  // const [subjects] = useState(["CN", "OS", "DBMS", "General"]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/subjects");
      setSubjects(res.subjects); // Store full subject objects
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      setLoading(false);
    }
  };

  const [tasks, setTasks] = useState([
    {
      id: Date.now(),
      title: "",
      text: "",
      date: "",
      type: "task",
      repeatEveryDays: 0,
    },
  ]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);

  /* ---------------- LOAD AVAILABLE DATES ---------------- */
  useEffect(() => {
    const loadDates = async () => {
      try {
        const res = await apiRequest("/tasks/available-dates");
        setAvailableDates(res.dates || []);
      } catch (err) {
        console.error("Failed to load dates:", err.message);
      }
    };
    loadDates();
  }, []);

  /* ---------------- HELPERS ---------------- */
  const updateTask = (id, field, value) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const addTask = () => {
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "",
        text: "",
        date: "",
        type: "task",
        repeatEveryDays: 0,
      },
    ]);
  };

  const removeTask = (id) => {
    if (tasks.length > 1) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const openCalendar = (taskId) => {
    setCurrentTaskId(taskId);
    setSelectedDate("");
    setShowCalendar(true);
  };

  const confirmCalendarDate = () => {
    if (!selectedDate || !currentTaskId) return;
    updateTask(currentTaskId, "date", selectedDate);
    setShowCalendar(false);
    setCurrentTaskId(null);
    setSelectedDate("");
  };

  /* ---------------- SCHEDULE ---------------- */
  const handleSchedule = async () => {
    if (!selectedSubject) {
      alert("Please select a subject");
      return;
    }

    const validTasks = tasks.filter(
      (t) => t.title.trim() && t.text.trim() && t.date
    );

    if (!validTasks.length) {
      alert("Please add at least one complete task");
      return;
    }

    const savedPayloads = [];

    try {
      for (const t of validTasks) {
        const payload = {
          subject: selectedSubject,
          title: t.title,
          text: t.text,
          assignedDate: t.date,
          type: t.type,
        };

        if (t.type === "general" && t.repeatEveryDays > 0) {
          payload.repeatEveryDays = Number(t.repeatEveryDays);
        }

        const res = await apiRequest("/tasks", "POST", payload);
        savedPayloads.push({ request: payload, response: res });
      }

      console.log("=== TASKS SAVED SUCCESSFULLY ===");
      console.log(savedPayloads);
      console.log("================================");

      alert("Tasks scheduled successfully");

      setSelectedSubject("");
      setTasks([
        {
          id: Date.now(),
          title: "",
          text: "",
          date: "",
          type: "task",
          repeatEveryDays: 0,
        },
      ]);
    } catch (err) {
      alert(err.message || "Failed to schedule tasks");
    }
  };

  return (
    <>
      {/* MAIN CARD */}
      <div className="h-[80vh] w-full bg-background border-2 border-primary rounded-lg p-4 flex flex-col overflow-hidden">
        <h2 className="font-kodchasan font-semibold mb-3">Schedule Tasks</h2>
        {/* className="mb-3 border-2 rounded px-3 py-2" */}
        {/* SUBJECT */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="mb-3 border-2 rounded px-3 py-2"
        >
          <option value="">Select a subject</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject.name}>
              {subject.name}
            </option>
          ))}
        </select>

        {/* TASK LIST */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {tasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 rounded-lg p-3"
            >
              <div className="flex justify-between mb-2">
                <strong>Task {idx + 1}</strong>
                {tasks.length > 1 && (
                  <button onClick={() => removeTask(task.id)}>×</button>
                )}
              </div>

              <input
                placeholder="Title"
                value={task.title}
                onChange={(e) => updateTask(task.id, "title", e.target.value)}
                className="w-full mb-2 border-2 rounded px-2 py-1"
              />

              <textarea
                placeholder="Description"
                value={task.text}
                onChange={(e) => updateTask(task.id, "text", e.target.value)}
                className="w-full mb-2 border-2 rounded px-2 py-1"
              />

              {/* TYPE DROPDOWN (NEW) */}
              <select
                value={task.type}
                onChange={(e) => updateTask(task.id, "type", e.target.value)}
                className="w-full mb-2 border-2 rounded px-2 py-1"
              >
                <option value="task">Task</option>
                <option value="pyq">PYQ</option>
                <option value="test">Test</option>
                <option value="fullrevision">Full Revision</option>
                <option value="general">General</option>
              </select>

              {/* GENERAL REPETITION INPUT */}
              {task.type === "general" && (
                <input
                  type="number"
                  min="0"
                  placeholder="Repeat every X days (0 = no repeat)"
                  value={task.repeatEveryDays}
                  onChange={(e) =>
                    updateTask(task.id, "repeatEveryDays", e.target.value)
                  }
                  className="w-full mb-2 border-2 rounded px-2 py-1"
                />
              )}

              <button
                onClick={() => openCalendar(task.id)}
                className="w-full border-2 rounded py-2"
              >
                {task.date ? `📅 ${task.date}` : "📅 Choose Date"}
              </button>
            </motion.div>
          ))}
        </div>

        <button onClick={addTask} className="mt-3 bg-accent1 py-2 rounded">
          + Add Task
        </button>

        <button
          onClick={handleSchedule}
          className="mt-2 bg-secondary text-white py-2 rounded font-bold"
        >
          Schedule
        </button>
      </div>

      {/* CALENDAR MODAL (UNCHANGED) */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCalendar(false)}
          >
            <motion.div
              className="bg-background p-5 rounded-xl w-[90%] max-w-md"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold mb-3">Available Dates (&lt; 3 tasks)</h3>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {availableDates.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setSelectedDate(d.key)}
                    className={`border-2 rounded py-2 ${
                      selectedDate === d.key
                        ? "border-secondary bg-secondary/20"
                        : ""
                    }`}
                  >
                    {d.display}
                  </button>
                ))}
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border-2 rounded px-3 py-2 mb-4"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCalendar(false)}
                  className="flex-1 border-2 rounded py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCalendarDate}
                  className="flex-1 bg-secondary text-white rounded py-2 font-bold"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
