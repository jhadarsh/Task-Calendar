import React, { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../service/api";

export default function TopCenter() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState({
    quoteTitle: "",
    quoteText: "",
    goals: [],
    monthlyTasks: [],
  });

  const [editingQuote, setEditingQuote] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [newTask, setNewTask] = useState("");
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ---------------- LOAD USER DATA ---------------- */
  useEffect(() => {
    if (!user) return;

    setProfile({
      quoteTitle: user.quote?.title || "Stay Consistent",
      quoteText:
        user.quote?.text ||
        "Small steps every day lead to big achievements.",
      goals: user.goals || [],
      monthlyTasks: user.monthlyTasks || [],
    });
  }, [user]);

  /* ---------------- QUOTE ---------------- */
  const saveQuote = async () => {
    setSaving(true);
    try {
      await apiRequest("/users/quote", "PUT", {
        title: profile.quoteTitle,
        text: profile.quoteText,
      });
      setEditingQuote(false);
    } catch (err) {
      alert(err.message || "Failed to save quote");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- GOALS ---------------- */
  const addGoal = async () => {
    if (!newGoal.trim()) return;
    const res = await apiRequest("/users/goals", "POST", {
      goal: newGoal.trim(),
    });
    setProfile((p) => ({ ...p, goals: res.user.goals }));
    setNewGoal("");
    setShowGoalInput(false);
  };

  const deleteGoal = async (goal) => {
    const res = await apiRequest(
      `/users/goals/${encodeURIComponent(goal)}`,
      "DELETE"
    );
    setProfile((p) => ({ ...p, goals: res.user.goals }));
  };

  /* ---------------- MONTHLY TASKS ---------------- */
  const addTask = async () => {
    if (!newTask.trim()) return;
    const res = await apiRequest("/users/monthly-tasks", "POST", {
      task: newTask.trim(),
    });
    setProfile((p) => ({ ...p, monthlyTasks: res.user.monthlyTasks }));
    setNewTask("");
    setShowTaskInput(false);
  };

  const deleteTask = async (task) => {
    const res = await apiRequest(
      `/users/monthly-tasks/${encodeURIComponent(task)}`,
      "DELETE"
    );
    setProfile((p) => ({ ...p, monthlyTasks: res.user.monthlyTasks }));
  };

  return (
 <div className="h-[30vh] min-h-[200px] w-full bg-background border-2 border-accent1 rounded-lg overflow-hidden flex flex-col">
      {/* TOP BAR */}
      <div className="flex justify-between items-center px-3 py-1.5 md:py-1.5 bg-gradient-to-r from-accent1/10 to-transparent border-b border-accent1/30">
        <div className="flex items-baseline gap-2">
          <h2 className="font-kodchasan text-primary text-base md:text-base font-bold leading-none">
            Welcome {user?.name}!
          </h2>
          <p className="font-kodchasan text-primary/50 text-[9px] md:text-[9px] hidden sm:block">
            {user?.email}
          </p>
        </div>

        <button
          onClick={logout}
          className="border border-red-400 text-red-500 px-2.5 py-0.5 md:py-0.5 rounded-full text-[9px] md:text-[9px] font-semibold hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          Logout
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 px-3 py-3 md:py-2 flex flex-col gap-3 md:gap-2">
        {/* QUOTE SECTION */}
        <div
          className="border-l-3 border-secondary pl-2 pr-1 py-2 md:py-1 bg-secondary/5 rounded-r relative group hover:bg-secondary/10 transition-colors"
          title="Double click to edit"
        >
          {editingQuote ? (
            <div className="space-y-1">
              <input
                value={profile.quoteTitle}
                onChange={(e) =>
                  setProfile({ ...profile, quoteTitle: e.target.value })
                }
                className="w-full text-base md:text-xl font-bold bg-background/50 border border-accent2 rounded px-1.5 py-0.5 md:py-0.5 outline-none focus:border-secondary"
                placeholder="Quote title..."
              />
              <input
                value={profile.quoteText}
                onChange={(e) =>
                  setProfile({ ...profile, quoteText: e.target.value })
                }
                className="w-full text-xs md:text-[10px] bg-background/50 border border-accent2 rounded px-1.5 py-0.5 md:py-0.5 outline-none focus:border-secondary"
                placeholder="Quote text..."
              />

              <button
                onClick={saveQuote}
                disabled={saving}
                className="absolute top-1 right-1 text-secondary text-[9px] md:text-[9px] flex items-center gap-0.5 md:gap-0.5 bg-background px-1.5 py-0.5 md:py-0.5 rounded hover:bg-secondary hover:text-white transition-all"
              >
                <Save size={10} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <div onDoubleClick={() => setEditingQuote(true)} className="cursor-pointer">
              <p className="font-bold text-base md:text-xl text-primary leading-tight">{profile.quoteTitle}</p>
              <p className="italic text-xs md:text-[10px] text-primary/70 mt-0.5 md:mt-0.5 leading-tight">
                "{profile.quoteText}"
              </p>
            </div>
          )}
        </div>

        {/* GOALS SECTION */}
        <div className="space-y-1.5 md:space-y-1">
          <p className="text-[10px] md:text-[9px] font-semibold text-primary/60 uppercase tracking-wide">Goals</p>
          <div className="flex flex-wrap gap-1.5 md:gap-1">
            {profile.goals.map((goal) => (
              <span
                key={goal}
                className="bg-accent1 text-primary text-sm md:text-[12px] px-2.5 md:px-2 py-1 md:py-0.5 rounded-full flex items-center gap-1 hover:bg-accent1/80 transition-colors"
              >
                {goal}
                <X
                  size={14}
                  className="md:w-[10px] md:h-[10px] cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => deleteGoal(goal)}
                />
              </span>
            ))}

            {showGoalInput ? (
              <input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addGoal();
                  if (e.key === 'Escape') setShowGoalInput(false);
                }}
                onBlur={() => {
                  if (newGoal.trim()) addGoal();
                  else setShowGoalInput(false);
                }}
                className="text-sm md:text-[10px] border border-primary rounded-full px-2.5 md:px-2 py-1 md:py-0.5 outline-none focus:border-secondary w-28 md:w-24"
                placeholder="New goal..."
                autoFocus
              />
            ) : (
              <button
                onClick={() => setShowGoalInput(true)}
                className="text-sm md:text-[10px] bg-primary text-white px-2.5 md:px-2 py-1 md:py-0.5 rounded-full hover:bg-primary/80 transition-all"
              >
                + Goal
              </button>
            )}
          </div>
        </div>

        {/* MONTHLY TASKS SECTION */}
        <div className="space-y-1.5 md:space-y-1">
          <p className="text-[10px] md:text-[9px] font-semibold text-primary/60 uppercase tracking-wide">Monthly Tasks</p>
          <div className="flex flex-wrap gap-1.5 md:gap-1">
            {profile.monthlyTasks.map((task) => (
              <span
                key={task}
                className="bg-accent2/30 text-primary text-xs md:text-[11px] px-2.5 md:px-1.5 py-1 md:py-0.5 rounded-full flex items-center gap-1 md:gap-0.5 hover:bg-accent2/40 transition-colors"
              >
                {task}
                <X
                  size={12}
                  className="md:w-[9px] md:h-[9px] cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => deleteTask(task)}
                />
              </span>
            ))}

            {showTaskInput ? (
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTask();
                  if (e.key === 'Escape') setShowTaskInput(false);
                }}
                onBlur={() => {
                  if (newTask.trim()) addTask();
                  else setShowTaskInput(false);
                }}
                className="text-xs md:text-[9px] border border-secondary rounded-full px-2.5 md:px-1.5 py-1 md:py-0.5 outline-none focus:border-secondary w-28 md:w-20"
                placeholder="New task..."
                autoFocus
              />
            ) : (
              <button
                onClick={() => setShowTaskInput(true)}
                className="text-xs md:text-[9px] bg-secondary text-white px-2.5 md:px-1.5 py-1 md:py-0.5 rounded-full hover:bg-secondary/80 transition-all"
              >
                + Task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
