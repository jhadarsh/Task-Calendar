import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from "../service/api";

export default function BottomCenter() {
  const [currentDate, setCurrentDate] = useState(new Date());
const [subjects, setSubjects] = useState([]); 
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showSubjectList, setShowSubjectList] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [tasksData, setTasksData] = useState({});
  const [loading, setLoading] = useState(false);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Fetch tasks for current month
  useEffect(() => {
    fetchMonthTasks();
  }, [currentDate]);

  const fetchMonthTasks = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      const response = await apiRequest(
        `/tasks?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
        "GET"
      );

      if (response.success && response.tasks) {
        const formattedData = formatTasksData(response.tasks);
        setTasksData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTasksData = (tasks) => {
    const formatted = {};
    
    tasks.forEach(task => {
      const date = new Date(task.assignedDate);
      // Fixed: Use correct date formatting
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      
      if (!formatted[key]) {
        formatted[key] = {
          tasks: [],
          pyqs: [],
          tests: [],
          revisions: [],
          fullrevisions: [],
          generals: []
        };
      }
      
      // Fixed: Use 'type' instead of 'taskType'
      if (task.type === 'task') {
        formatted[key].tasks.push(task);
      } else if (task.type === 'pyq') {
        formatted[key].pyqs.push(task);
      } else if (task.type === 'test') {
        formatted[key].tests.push(task);
      } else if (task.type === 'revision') {
        formatted[key].revisions.push(task);
      } else if (task.type === 'fullrevision') {
        formatted[key].fullrevisions.push(task);
      } else if (task.type === 'general') {
        formatted[key].generals.push(task);
      }
    });
    
    return formatted;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };








  

const addSubject = async () => {
  if (!newSubject.trim()) return;

  try {
    const res = await apiRequest("/subjects", "POST", {
      name: newSubject.trim(),
    });

    // Update local subject list from backend response
    setSubjects((prev) => [...prev, res.subject.name]);

    setNewSubject("");
    setShowSubjectModal(false);

    console.log("Subject added:", res.subject);
  } catch (err) {
    alert(err.message || "Failed to add subject");
  }
};


const showAllSubjects = async () => {
  try {
    const res = await apiRequest("/subjects");

    // Store the full objects, not just names
    setSubjects(res.subjects);

    setShowSubjectList(true);

    console.log("Fetched subjects:", res.subjects);
  } catch (err) {
    alert(err.message || "Failed to fetch subjects");
  }
};


const deleteSubject = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this subject?"
  );

  if (!confirmDelete) return;

  try {
    await apiRequest(`/subjects/${id}`, "DELETE");

    // remove from UI immediately
    setSubjects((prev) => prev.filter((s) => s._id !== id));

    console.log("Subject deleted:", id);
  } catch (err) {
    alert(err.message || "Failed to delete subject");
  }
};


  const getDateKey = (day) => {
    return `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
  };

  const getTodayKey = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  };

  const isToday = (day) => {
    if (!day) return false;
    return getDateKey(day) === getTodayKey();
  };

  const getCardBorderColor = (day) => {
    if (!day) return 'border-transparent';

    if (isToday(day)) return 'border-green-500';

    if (isPastDate(day)) return 'border-gray-400';

    const dateKey = getDateKey(day);
    const data = tasksData[dateKey];

    if (!data) return 'border-accent1';

    // Priority: test > pyq > task
    if (data.tests && data.tests.length > 0) return 'border-secondary';
    if (data.pyqs && data.pyqs.length > 0) return 'border-green-500';
    if (data.tasks && data.tasks.length > 0) return 'border-accent2';

    return 'border-accent1';
  };

  const isPastDate = (day) => {
    if (!day) return false;
    const today = new Date();
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return checkDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const dateKey = getDateKey(day);
    const data = tasksData[dateKey];
    if (data) {
      setSelectedDate({ day, data, dateKey });
      setShowDateModal(true);
    }
  };

  const getIndicatorCircles = (dateKey) => {
    const data = tasksData[dateKey];
    if (!data) return [];

    const circles = [];
    
    // Red circle for tasks (or green if all completed)
    if (data.tasks && data.tasks.length > 0) {
      const allCompleted = data.tasks.every(t => t.status === 'completed');
      circles.push({
        color: allCompleted ? 'bg-green-500' : 'bg-red-500',
        count: data.tasks.length,
        title: `${data.tasks.length} Tasks`
      });
    }
    
    // Yellow circle for PYQs
    if (data.pyqs && data.pyqs.length > 0) {
      circles.push({
        color: 'bg-yellow-500',
        count: data.pyqs.length,
        title: `${data.pyqs.length} PYQs`
      });
    }
    
    // Black circle for tests
    if (data.tests && data.tests.length > 0) {
      circles.push({
        color: 'bg-black',
        count: data.tests.length,
        title: `${data.tests.length} Tests`
      });
    }
    
    // Purple circle for generals
    if (data.generals && data.generals.length > 0) {
      circles.push({
        color: 'bg-purple-500',
        count: data.generals.length,
        title: `${data.generals.length} General`
      });
    }
    
    // Blue circle for full revisions
    if (data.fullrevisions && data.fullrevisions.length > 0) {
      circles.push({
        color: 'bg-blue-500',
        count: data.fullrevisions.length,
        title: `${data.fullrevisions.length} Full Revisions`
      });
    }
    
    // Cyan circle for revisions
    if (data.revisions && data.revisions.length > 0) {
      circles.push({
        color: 'bg-cyan-500',
        count: data.revisions.length,
        title: `${data.revisions.length} Revisions`
      });
    }
    
    return circles;
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="h-full w-full bg-background border-2 border-accent1 rounded-lg p-3 sm:p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-kodchasan text-primary text-sm sm:text-base md:text-lg font-semibold">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          {loading && <span className="text-xs text-primary">Loading...</span>}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={showAllSubjects}
            className="bg-accent2 text-primary px-2 sm:px-3 py-1 rounded-lg font-kodchasan text-xs sm:text-sm font-semibold"
          >
            Subjects
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSubjectModal(true)}
            className="bg-secondary text-background w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-kodchasan text-base sm:text-lg font-bold"
          >
            +
          </motion.button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-kodchasan text-primary font-semibold text-[10px] sm:text-xs">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-3 flex-1">
        <AnimatePresence mode="wait">
          {days.map((day, index) => {
            const circles = day ? getIndicatorCircles(getDateKey(day)) : [];
            
            return (
              <motion.div
                key={`${currentDate.getMonth()}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => handleDateClick(day)}
                className={`relative rounded-md border-2 ${getCardBorderColor(day)} bg-background p-1 cursor-pointer transition-all hover:shadow-md ${
                  isPastDate(day) ? 'opacity-40' : ''
                } ${day ? 'min-h-[40px] sm:min-h-[50px]' : ''}`}
              >
                {day && (
                  <>
                    {isPastDate(day) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200/60 backdrop-blur-md border rounded-lg"></div>
                    )}
                    <div className="font-kodchasan text-primary text-[10px] sm:text-xs font-semibold relative z-10">
                      {day}
                    </div>
                    {circles.length > 0 && (
                      <div className="absolute -top-2 -right-2 z-20">
                        <motion.div 
                          className="relative w-8 h-8 sm:w-10 sm:h-10"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 260, 
                            damping: 20,
                            delay: index * 0.01 + 0.2 
                          }}
                        >
                          {circles.map((circle, idx) => {
                            const positions = [
                              { top: 0, right: 0 },
                              { top: '40%', right: '40%' },
                              { bottom: 0, right: '20%' },
                              { top: '20%', right: '60%' },
                              { bottom: '20%', right: 0 },
                              { top: '60%', right: '10%' }
                            ];
                            
                            return (
                              <motion.div 
                                key={idx}
                                className={`absolute w-4 h-4 sm:w-5 sm:h-5 ${circle.color} rounded-full shadow-lg border-2 border-white flex items-center justify-center`}
                                title={circle.title}
                                style={positions[idx] || positions[0]}
                                whileHover={{ scale: 1.3, zIndex: 30 }}
                                animate={{ 
                                  y: [0, -2, 0],
                                }}
                                transition={{
                                  y: {
                                    repeat: Infinity,
                                    duration: 2,
                                    ease: "easeInOut",
                                    delay: idx * 0.3
                                  }
                                }}
                              >
                                <span className="text-white text-[8px] sm:text-[10px] font-bold">
                                  {circle.count}
                                </span>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <motion.button
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevMonth}
          className="bg-secondary text-background px-2 sm:px-3 py-1.5 rounded-lg font-kodchasan font-semibold text-xs sm:text-sm"
        >
          ← Prev
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentDate(new Date())}
          className="bg-accent2 text-primary px-2 sm:px-3 py-1.5 rounded-lg font-kodchasan font-semibold text-xs sm:text-sm"
        >
          Today
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, x: 3 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextMonth}
          className="bg-secondary text-background px-2 sm:px-3 py-1.5 rounded-lg font-kodchasan font-semibold text-xs sm:text-sm"
        >
          Next →
        </motion.button>
      </div>

      {/* Date Details Modal */}
      <AnimatePresence>
        {showDateModal && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-background border-2 border-accent1 rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-kodchasan text-primary text-lg sm:text-xl font-bold mb-4">
                Date: {selectedDate.day} {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              
              <div className="space-y-4">
                {/* Tasks */}
                {selectedDate.data.tasks && selectedDate.data.tasks.length > 0 && (
                  <div>
                    <h4 className="font-kodchasan text-primary font-semibold text-base mb-2">Tasks:</h4>
                    {selectedDate.data.tasks.map((task, idx) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-red-50 border-2 border-red-500 rounded-lg p-3 mb-2"
                      >
                        <p className="font-kodchasan text-primary font-semibold text-sm">{task.title}</p>
                        <p className="font-kodchasan text-primary font-semibold">Subject: {task.subject}</p>
                        <p className="font-kodchasan text-primary/70 text-sm">Status: {task.status}</p>
                        {task.text && <p className="font-kodchasan text-primary/70 text-sm">{task.text}</p>}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* PYQs */}
                {selectedDate.data.pyqs && selectedDate.data.pyqs.length > 0 && (
                  <div>
                    <h4 className="font-kodchasan text-primary font-semibold text-base mb-2">PYQs:</h4>
                    {selectedDate.data.pyqs.map((task, idx) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-3 mb-2"
                      >
                        <p className="font-kodchasan text-primary font-semibold text-sm">{task.title}</p>
                        <p className="font-kodchasan text-primary font-semibold">Subject: {task.subject}</p>
                        <p className="font-kodchasan text-primary/70 text-sm">Status: {task.status}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Tests */}
                {selectedDate.data.tests && selectedDate.data.tests.length > 0 && (
                  <div>
                    <h4 className="font-kodchasan text-primary font-semibold text-base mb-2">Tests:</h4>
                    {selectedDate.data.tests.map((task, idx) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-100 border-2 border-black rounded-lg p-3 mb-2"
                      >
                        <p className="font-kodchasan text-primary font-semibold text-sm">{task.title}</p>
                        <p className="font-kodchasan text-primary font-semibold">Subject: {task.subject}</p>
                        <p className="font-kodchasan text-primary/70 text-sm">Status: {task.status}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Full Revisions */}
                {selectedDate.data.fullrevisions && selectedDate.data.fullrevisions.length > 0 && (
                  <div>
                    <h4 className="font-kodchasan text-primary font-semibold text-base mb-2">Full Revisions:</h4>
                    {selectedDate.data.fullrevisions.map((task, idx) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-blue-50 border-2 border-blue-500 rounded-lg p-3 mb-2"
                      >
                        <p className="font-kodchasan text-primary font-semibold text-sm">{task.title}</p>
                        <p className="font-kodchasan text-primary font-semibold">Subject: {task.subject}</p>
                        <p className="font-kodchasan text-primary/70 text-sm">Status: {task.status}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Revisions */}
                {selectedDate.data.revisions && selectedDate.data.revisions.length > 0 && (
                  <div>
                    <h4 className="font-kodchasan text-primary font-semibold text-base mb-2">Revisions:</h4>
                    {selectedDate.data.revisions.map((task, idx) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-cyan-50 border-2 border-cyan-500 rounded-lg p-3 mb-2"
                      >
                        <p className="font-kodchasan text-primary font-semibold text-sm">{task.title}</p>
                        <p className="font-kodchasan text-primary font-semibold">Subject: {task.subject}</p>
                        <p className="font-kodchasan text-primary/70 text-sm">Status: {task.status}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Generals */}
                {selectedDate.data.generals && selectedDate.data.generals.length > 0 && (
                  <div>
                    <h4 className="font-kodchasan text-primary font-semibold text-base mb-2">General:</h4>
                    {selectedDate.data.generals.map((task, idx) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-purple-50 border-2 border-purple-500 rounded-lg p-3 mb-2"
                      >
                        <p className="font-kodchasan text-primary font-semibold text-sm">{task.title}</p>
                        <p className="font-kodchasan text-primary font-semibold">Subject: {task.subject}</p>
                        <p className="font-kodchasan text-primary/70 text-sm">Status: {task.status}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDateModal(false)}
                className="w-full bg-secondary text-background py-2 rounded-lg font-kodchasan font-semibold mt-4"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showSubjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-background border-2 border-accent1 rounded-lg p-4 sm:p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-kodchasan text-primary text-lg sm:text-xl font-bold mb-4">Add Subject</h3>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Enter subject name"
                className="w-full border-2 border-accent1 rounded-lg px-3 sm:px-4 py-2 font-kodchasan text-primary mb-4 focus:outline-none focus:border-secondary text-sm sm:text-base bg-background"
                onKeyPress={(e) => e.key === 'Enter' && addSubject()}
              />
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addSubject}
                  className="flex-1 bg-secondary text-background py-2 rounded-lg font-kodchasan font-semibold text-sm sm:text-base"
                >
                  Add
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSubjectModal(false)}
                  className="flex-1 bg-accent1 text-primary py-2 rounded-lg font-kodchasan font-semibold text-sm sm:text-base"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject List Modal */}
<AnimatePresence mode="wait">
  {showSubjectList && (
    <motion.div
      key="subject-modal" // Add key
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-primary/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowSubjectList(false)}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="bg-background border-2 border-accent1 rounded-lg p-4 sm:p-6 max-w-sm w-full max-h-96 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-kodchasan text-primary text-lg sm:text-xl font-bold mb-4">
          All Subjects
        </h3>

        {subjects.length === 0 ? (
          <p className="font-kodchasan text-primary/60 text-center text-sm sm:text-base">
            No subjects added yet
          </p>
        ) : (
          <div className="space-y-2">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject._id} // Now this will work!
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between bg-accent1/20 border-2 border-accent1 text-primary px-3 sm:px-4 py-2 rounded-lg font-kodchasan text-sm sm:text-base"
              >
                <span>{subject.name}</span> {/* Now this will work! */}

                <button
                  onClick={() => deleteSubject(subject._id)}
                  className="text-red-500 font-bold text-lg hover:scale-110 transition-transform"
                  title="Delete subject"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSubjectList(false)}
          className="w-full bg-secondary text-background py-2 rounded-lg font-kodchasan font-semibold mt-4 text-sm sm:text-base"
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
}