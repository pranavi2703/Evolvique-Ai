import { useState, useEffect } from "react";
import {
  BrainCircuit,
  LayoutDashboard,
  Target,
  ListTodo,
  Timer,
  ChartNoAxesCombined,
  Sparkles,
  Plus,
  CheckCircle2,
  Trash2
} from "lucide-react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("evolvique-tasks");
      return saved
        ? JSON.parse(saved)
        : [
            { id: 1, title: "Practice Java", done: false },
            { id: 2, title: "Revise Computer Networks", done: false },
            { id: 3, title: "Complete assignment", done: true }
          ];
    } catch {
      return [];
    }
  });

  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem("evolvique-goals");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 1,
              title: "Learn Java Programming",
              description: "Build a strong programming foundation.",
              progress: 60,
              targetDate: ""
            }
          ];
    } catch {
      return [];
    }
  });

  const [newTask, setNewTask] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [activeNav, setActiveNav] = useState("dashboard");

  const [selectedTaskId, setSelectedTaskId] = useState(() => tasks.find((task) => !task.done)?.id ?? null);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);
  const [timerMessage, setTimerMessage] = useState("");

  const getTaskMinutes = (title) => {
    const text = title.toLowerCase();
    if (/project|assignment|practice|implement|build|solve|coding|code/.test(text)) return 40;
    if (/revise|revision|review|prepare|exam|test|study/.test(text)) return 30;
    if (/read|watch|learn|understand|research|notes/.test(text)) return 20;
    return 25;
  };

  // Simple built-in goal breakdown. This works locally and does not call an AI API.
  const splitGoalIntoTasks = (goalTitle) => {
    const title = goalTitle.toLowerCase();
    if (/javascript/.test(title)) {
      return [
        "Learn JavaScript variables, data types, and operators",
        "Practice conditions, loops, and functions in JavaScript",
        "Learn arrays, objects, and basic array methods",
        "Practice DOM events or solve JavaScript coding exercises",
        "Build a small JavaScript project and review mistakes"
      ];
    }
    if (/java programming|learn java|java language/.test(title)) {
      return [
        "Learn Java syntax, variables, and data types",
        "Practice conditions, loops, and methods in Java",
        "Understand classes, objects, and constructors",
        "Practice arrays and object-oriented programming",
        "Build a small Java program and review errors"
      ];
    }
    if (/python/.test(title)) {
      return [
        "Learn Python syntax, variables, and data types",
        "Practice conditions, loops, and functions",
        "Work with lists, dictionaries, and strings",
        "Solve beginner Python coding problems",
        "Build a small Python project and review mistakes"
      ];
    }
    if (/programming|coding|software|web development/.test(title)) {
      return [
        `Review the fundamentals needed for: ${goalTitle}`,
        "Learn and practice the main concepts",
        "Complete beginner exercises related to the goal",
        "Build a small project using what you learned",
        "Test the result, fix mistakes, and revise"
      ];
    }
    if (/exam|test|study|subject|course|learn/.test(title)) {
      return [
        `List the important topics for: ${goalTitle}`,
        `Study the first topic and make notes`,
        `Study the remaining topics`,
        `Practice questions related to: ${goalTitle}`,
        `Review notes and test your understanding`
      ];
    }
    if (/fitness|exercise|workout|health/.test(title)) {
      return [
        `Set up a simple plan for: ${goalTitle}`,
        `Complete the first practice session`,
        `Practice consistently and track progress`,
        `Review progress and adjust the plan`
      ];
    }
    return [
      `Break down the first step of: ${goalTitle}`,
      `Work on the main part of: ${goalTitle}`,
      `Practice or make progress on: ${goalTitle}`,
      `Review your work and finish: ${goalTitle}`
    ];
  };

  const activeTask =
    tasks.find((task) => task.id === selectedTaskId && !task.done) ||
    tasks.find((task) => !task.done) ||
    null;

  useEffect(() => {
    localStorage.setItem("evolvique-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("evolvique-goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    const task = tasks.find((item) => item.id === selectedTaskId && !item.done);
    if (task) setSecondsLeft((task.durationMinutes || getTaskMinutes(task.title)) * 60);
  }, [selectedTaskId]);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
      setTotalStudySeconds((s) => s + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (secondsLeft !== 0 || !isRunning) return;

    if (activeTask && !activeTask.done) {
      // If the task is unfinished, automatically add another 5 minutes.
      setSecondsLeft(5 * 60);
      setTimerMessage(`Extra 5 minutes added for: ${activeTask.title}`);
    } else {
      setIsRunning(false);
      setTimerMessage("Focus session complete!");
    }
  }, [secondsLeft, isRunning, activeTask]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask.trim(),
      done: false,
      durationMinutes: getTaskMinutes(newTask.trim())
    };
    setTasks((prev) => [...prev, task]);
    setSelectedTaskId(task.id);
    setIsRunning(false);
    setSecondsLeft(task.durationMinutes * 60);
    setTimerMessage(`Timer set for ${task.durationMinutes} minutes.`);
    setNewTask("");
  };

  const toggleTask = (id) => {
    const currentTask = tasks.find((task) => task.id === id);
    if (!currentTask) return;
    const nowDone = !currentTask.done;

    setTasks((prev) => prev.map((task) =>
      task.id === id ? { ...task, done: nowDone } : task
    ));

    if (nowDone && selectedTaskId === id) {
      const nextTask = tasks.find((task) => task.id !== id && !task.done);
      setIsRunning(false);
      if (nextTask) {
        const duration = nextTask.durationMinutes || getTaskMinutes(nextTask.title);
        setSelectedTaskId(nextTask.id);
        setSecondsLeft(duration * 60);
        setTimerMessage(`Task completed! Timer switched to: ${nextTask.title} (${duration} minutes).`);
      } else {
        setSelectedTaskId(null);
        setSecondsLeft(0);
        setTimerMessage("Task completed! No pending tasks left.");
      }
    }

    if (currentTask.goalId) {
      const relatedTasks = tasks.filter((task) => task.goalId === currentTask.goalId);
      const completed = relatedTasks.filter((task) => task.done || (task.id === id && nowDone)).length;
      const progress = relatedTasks.length ? Math.round((completed / relatedTasks.length) * 100) : 0;
      setGoals((prev) => prev.map((goal) =>
        goal.id === currentTask.goalId ? { ...goal, progress } : goal
      ));
    }
  };

  const selectTaskForTimer = (task) => {
    if (task.done) return;
    const duration = task.durationMinutes || getTaskMinutes(task.title);
    setSelectedTaskId(task.id);
    setIsRunning(false);
    setSecondsLeft(duration * 60);
    setTimerMessage(`Timer set for ${duration} minutes: ${task.title}`);
    setActiveNav("study");
  };

  const deleteTask = (id) => {
    const deletingSelectedTask = selectedTaskId === id;
    const nextTask = tasks.find((task) => task.id !== id && !task.done);
    setTasks((prev) => prev.filter((task) => task.id !== id));
    if (deletingSelectedTask) {
      setIsRunning(false);
      if (nextTask) {
        const duration = nextTask.durationMinutes || getTaskMinutes(nextTask.title);
        setSelectedTaskId(nextTask.id);
        setSecondsLeft(duration * 60);
        setTimerMessage(`Timer switched to: ${nextTask.title}`);
      } else {
        setSelectedTaskId(null);
        setSecondsLeft(0);
        setTimerMessage("No pending tasks. Select or add a task to start.");
      }
    }
  };

  const addGoal = (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    const goalId = Date.now();
    const goalTitle = newGoal.trim();
    const goalTasks = splitGoalIntoTasks(goalTitle).map((title, index) => ({
      id: goalId + index + 1,
      title,
      done: false,
      goalId,
      durationMinutes: getTaskMinutes(title)
    }));

    setGoals((prev) => [...prev, {
      id: goalId,
      title: goalTitle,
      description: "Your goal has been divided into smaller tasks.",
      progress: 0,
      targetDate: goalDate
    }]);
    setTasks((prev) => [...prev, ...goalTasks]);
    if (goalTasks.length) {
      setSelectedTaskId(goalTasks[0].id);
      setIsRunning(false);
      setSecondsLeft(goalTasks[0].durationMinutes * 60);
      setTimerMessage(`Goal divided into ${goalTasks.length} tasks. Timer set for the first task.`);
    }

    setNewGoal("");
    setGoalDate("");
  };

  const updateGoalProgress = (id, progress) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? { ...goal, progress: Number(progress) }
          : goal
      )
    );
  };

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const completedTasks = tasks.filter((task) => task.done).length;
  const completedGoals = goals.filter((goal) => goal.progress === 100).length;
  const activeGoals = goals.filter((goal) => goal.progress < 100).length;

  const taskPercentage = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const studyMinutes = Math.floor(totalStudySeconds / 60);
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "goals", label: "Goal Tracker", icon: Target },
    { id: "tasks", label: "My Tasks", icon: ListTodo },
    { id: "study", label: "Study Timer", icon: Timer },
    { id: "progress", label: "Progress", icon: ChartNoAxesCombined }
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" onClick={(e) => { e.preventDefault(); setActiveNav("dashboard"); }}>
          <img
            src="/evolvique-logo.png"
            alt="Evolvique AI logo"
            className="brand-logo"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="brand-text">
            <h2>
              Evolvique <span>AI</span>
            </h2>
            <p>LEARN • FOCUS • GROW</p>
          </div>
        </a>

        <nav className="sidebar-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeNav === id ? "nav-link active" : "nav-link"}
              onClick={(e) => {
                e.preventDefault();
                setActiveNav(id);
                window.scrollTo({ top: 0, behavior: "auto" });
              }}
            >
              <Icon size={19} />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-icon">
            <BrainCircuit size={22} />
          </div>
          <p>Small steps lead to big achievements.</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR PERSONAL AI LEARNING SPACE</p>
            <h1>Welcome to Evolvique AI</h1>
            <p className="subtitle">
              Learn consistently. Focus deeply. Grow every day.
            </p>
          </div>
          <div className="topbar-badge">
            <Sparkles size={17} />
            <span>Smart Productivity</span>
          </div>
        </header>

        {activeNav === "dashboard" && <section id="dashboard" className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Your Dashboard</h2>
              <p>Here is your learning overview.</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon purple">
                <Target size={22} />
              </div>
              <p>Active Goals</p>
              <h3>{activeGoals}</h3>
              <span>Keep moving forward</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon cyan">
                <CheckCircle2 size={22} />
              </div>
              <p>Tasks Completed</p>
              <h3>{completedTasks}/{tasks.length}</h3>
              <span>{taskPercentage}% completion</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon pink">
                <Timer size={22} />
              </div>
              <p>Study Time</p>
              <h3>{studyMinutes} min</h3>
              <span>Total tracked study time</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">
                <ChartNoAxesCombined size={22} />
              </div>
              <p>Goals Achieved</p>
              <h3>{completedGoals}</h3>
              <span>Celebrate your progress</span>
            </div>
          </div>

          <div className="content-grid" style={{ marginTop: "24px" }}>
            <div className="panel goals-panel">
              <div className="panel-heading">
                <div>
                  <h2><Target size={20} /> Your Goals</h2>
                  <p>Keep track of what you want to achieve.</p>
                </div>
                <button className="secondary-button" onClick={() => setActiveNav("goals")}>View all</button>
              </div>
              {goals.length === 0 ? (
                <p className="empty-state">No goals yet. Add a goal in Goal Tracker.</p>
              ) : goals.slice(0, 3).map((goal) => (
                <div className="goal-item" key={goal.id}>
                  <div className="goal-heading"><div><h3>{goal.title}</h3><p>{goal.progress}% complete</p></div></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${goal.progress}%` }} /></div>
                </div>
              ))}
            </div>

            <div className="panel tasks-panel">
              <div className="panel-heading">
                <div>
                  <h2><ListTodo size={20} /> Upcoming Tasks</h2>
                  <p>Select a task to open its matching timer.</p>
                </div>
                <button className="secondary-button" onClick={() => setActiveNav("tasks")}>View all</button>
              </div>
              {tasks.filter((task) => !task.done).length === 0 ? (
                <p className="empty-state">No pending tasks. Add a goal or task to get started.</p>
              ) : tasks.filter((task) => !task.done).slice(0, 4).map((task) => (
                <div className="task-item" key={task.id}>
                  <button type="button" className="task-title" onClick={() => selectTaskForTimer(task)} style={{ textAlign: "left", background: "none", border: "none", padding: 0 }}>
                    {task.title}
                    <small style={{ display: "block" }}>{task.durationMinutes || getTaskMinutes(task.title)} min · Select to start</small>
                  </button>
                  <button type="button" className="secondary-button" onClick={() => selectTaskForTimer(task)}>Select</button>
                </div>
              ))}
            </div>
          </div>

          <section className="panel study-panel" style={{ marginTop: "24px" }}>
            <div className="panel-heading">
              <div>
                <h2><Timer size={20} /> Focus Timer</h2>
                <p>{activeTask ? `Selected task: ${activeTask.title}` : "Select a pending task to set its timer."}</p>
              </div>
              <button className="secondary-button" onClick={() => setActiveNav("study")}>Open timer</button>
            </div>
            <div className="timer-content">
              <div className="timer-ring"><div className="timer-inner">
                <span className="timer-label">{activeTask ? `${activeTask.durationMinutes || getTaskMinutes(activeTask.title)} MIN TASK` : "FOCUS TIME"}</span>
                <div className="timer-display">{minutes}:{seconds}</div>
                <span className="timer-status">{isRunning ? "Stay focused" : activeTask ? "Ready when you are" : "No pending tasks"}</span>
              </div></div>
              <div className="timer-controls">
                <p>{timerMessage || "Choose a task and start focusing."}</p>
                <div className="timer-buttons">
                  <button className="primary-button" disabled={isRunning || !activeTask} onClick={() => { setTimerMessage(`Focusing on: ${activeTask.title}`); setIsRunning(true); }}>Start Focus</button>
                  <button className="secondary-button" disabled={!isRunning} onClick={() => setIsRunning(false)}>Pause</button>
                  <button className="secondary-button" onClick={() => { setIsRunning(false); const duration = activeTask?.durationMinutes || (activeTask ? getTaskMinutes(activeTask.title) : 25); setSecondsLeft(duration * 60); setTimerMessage(activeTask ? `Timer reset to ${duration} minutes.` : "Timer reset."); }}>Reset</button>
                </div>
              </div>
            </div>
          </section>

          <section className="panel progress-panel" style={{ marginTop: "24px" }}>
            <div className="panel-heading"><div><h2><ChartNoAxesCombined size={20} /> Progress Overview</h2><p>Your progress at a glance.</p></div></div>
            <div className="progress-details">
              <div className="progress-summary"><div><span>Task completion</span><strong>{taskPercentage}%</strong></div><div className="progress-track large"><div className="progress-fill" style={{ width: `${taskPercentage}%` }} /></div><p>{completedTasks} of {tasks.length} tasks completed</p></div>
              <div className="progress-summary"><div><span>Goals completed</span><strong>{completedGoals}/{goals.length}</strong></div><div className="progress-track large"><div className="progress-fill cyan-fill" style={{ width: `${goals.length ? (completedGoals / goals.length) * 100 : 0}%` }} /></div><p>{studyMinutes} minutes of study time tracked</p></div>
            </div>
          </section>
        </section>}

        {(activeNav === "goals" || activeNav === "tasks") && <section className="content-grid" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
          {activeNav === "goals" && <div id="goals" className="panel goals-panel">
            <div className="panel-heading">
              <div>
                <h2><Target size={20} /> Goal Tracker</h2>
                <p>Turn your ambitions into progress.</p>
              </div>
            </div>

            <form className="goal-form" onSubmit={addGoal}>
              <input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Enter a new goal..."
                aria-label="New goal"
                required
              />
              <input
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                aria-label="Goal target date"
              />
              <button type="submit" className="primary-button">
                <Plus size={17} /> Add Goal
              </button>
            </form>

            <div className="goal-list">
              {goals.length === 0 && (
                <p className="empty-state">
                  No goals yet. Add your first goal above!
                </p>
              )}

              {goals.map((goal) => (
                <div className="goal-item" key={goal.id}>
                  <div className="goal-heading">
                    <div>
                      <h3>{goal.title}</h3>
                      <p>{goal.description}</p>
                      {goal.targetDate && (
                        <small>Target: {goal.targetDate}</small>
                      )}
                    </div>
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => deleteGoal(goal.id)}
                      aria-label={`Delete ${goal.title}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="goal-progress-row">
                    <span>Progress</span>
                    <strong>{goal.progress}%</strong>
                  </div>

                  <input
                    className="progress-slider"
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={goal.progress}
                    onChange={(e) =>
                      updateGoalProgress(goal.id, e.target.value)
                    }
                    aria-label={`${goal.title} progress`}
                  />

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  {goal.progress === 100 && (
                    <p className="goal-complete">
                      <CheckCircle2 size={16} /> Goal completed!
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>}

          {activeNav === "tasks" && <div id="tasks" className="panel tasks-panel">
            <div className="panel-heading">
              <div>
                <h2><ListTodo size={20} /> My Tasks</h2>
                <p>One task at a time.</p>
              </div>
              <span className="task-count">{tasks.length} tasks</span>
            </div>

            <form className="task-form" onSubmit={addTask}>
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What do you need to do?"
                aria-label="New task"
                required
              />
              <button
                type="submit"
                className="primary-button add-task-button"
                aria-label="Add task"
              >
                <Plus size={19} />
              </button>
            </form>

            <div className="task-list">
              {tasks.length === 0 && (
                <p className="empty-state">
                  No tasks yet. Add something to work on!
                </p>
              )}

              {tasks.map((task) => (
                <div className="task-item" key={task.id}>
                  <label className="task-label">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span
                      className={task.done ? "task-title done" : "task-title"}
                      title="Select this task to set its timer"
                      onClick={(e) => { e.preventDefault(); selectTaskForTimer(task); }}
                      style={{ cursor: task.done ? "default" : "pointer" }}
                    >
                      {task.title}
                      {!task.done && <small style={{ display: "block" }}>{task.durationMinutes || getTaskMinutes(task.title)} min · click to set timer</small>}
                    </span>
                  </label>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

          </div>}
        </section>}

        {activeNav === "study" && <section id="study" className="panel study-panel">
          <div className="panel-heading">
            <div>
              <h2><Timer size={20} /> Focus Session</h2>
              <p>{activeTask ? `Current task: ${activeTask.title}` : "Choose a task to begin a focus session."}</p>
            </div>
          </div>

          <div className="timer-content">
            <div className="timer-ring">
              <div className="timer-inner">
                <span className="timer-label">{activeTask ? `${activeTask.durationMinutes || getTaskMinutes(activeTask.title)} MIN TASK` : "FOCUS TIME"}</span>
                <div className="timer-display">{minutes}:{seconds}</div>
                <span className="timer-status">
                  {isRunning ? "Stay focused" : activeTask ? "Ready when you are" : "No pending tasks"}
                </span>
              </div>
            </div>

            <div className="timer-controls">
              <p>{timerMessage || "Make time for what matters."}</p>
              <div className="timer-buttons">
                <button
                  className="primary-button"
                  onClick={() => {
                    if (secondsLeft <= 0) setSecondsLeft((activeTask?.durationMinutes || 25) * 60);
                    setTimerMessage(activeTask ? `Focusing on: ${activeTask.title}` : "Choose a task first.");
                    if (activeTask) setIsRunning(true);
                  }}
                  disabled={isRunning || !activeTask}
                >
                  Start Focus
                </button>
                <button
                  className="secondary-button"
                  onClick={() => setIsRunning(false)}
                  disabled={!isRunning}
                >
                  Pause
                </button>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setIsRunning(false);
                    const duration = activeTask?.durationMinutes || (activeTask ? getTaskMinutes(activeTask.title) : 25);
                    setSecondsLeft(duration * 60);
                    setTimerMessage(activeTask ? `Timer reset to ${duration} minutes.` : "Timer reset.");
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>}

        {activeNav === "progress" && <section id="progress" className="panel progress-panel">
          <div className="panel-heading">
            <div>
              <h2><ChartNoAxesCombined size={20} /> Your Progress</h2>
              <p>Every completed task is a step forward.</p>
            </div>
          </div>

          <div className="progress-details">
            <div className="progress-summary">
              <div>
                <span>Task completion</span>
                <strong>{taskPercentage}%</strong>
              </div>
              <div className="progress-track large">
                <div
                  className="progress-fill"
                  style={{ width: `${taskPercentage}%` }}
                />
              </div>
              <p>{completedTasks} of {tasks.length} tasks completed</p>
            </div>

            <div className="progress-summary">
              <div>
                <span>Goals completed</span>
                <strong>{completedGoals}/{goals.length}</strong>
              </div>
              <div className="progress-track large">
                <div
                  className="progress-fill cyan-fill"
                  style={{
                    width: `${
                      goals.length
                        ? (completedGoals / goals.length) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
              <p>Keep working towards your goals.</p>
            </div>
          </div>
        </section>}

        <footer className="footer">
          <BrainCircuit size={17} />
          <span>Evolvique AI</span>
          <span className="footer-dot">•</span>
          <span>Learn • Focus • Grow</span>
        </footer>
      </main>
    </div>
  );
}

export default App;