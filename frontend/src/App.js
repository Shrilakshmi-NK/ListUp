// ============================================================
// FILE: frontend/src/App.js
// PURPOSE: The main React component. Handles all UI logic.
// ============================================================

import React, { useState, useEffect } from "react";
import "./App.css";
import { fetchTasks, createTask, updateTask, deleteTask } from "./api";

function App() {
  // ---- STATE (React's way of storing data that can change) ----

  const [tasks, setTasks] = useState([]);           // All tasks from the database
  const [newTitle, setNewTitle] = useState("");      // What the user is typing
  const [filter, setFilter] = useState("all");       // "all" | "completed" | "pending"
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"
  const [darkMode, setDarkMode] = useState(false);   // true = dark mode on
  const [editingId, setEditingId] = useState(null);  // ID of task being edited (null = none)
  const [editingTitle, setEditingTitle] = useState(""); // Text in edit input
  const [error, setError] = useState("");            // Error message to show user
  const [loading, setLoading] = useState(true);      // Show loading spinner

  // ---- LOAD TASKS ON PAGE LOAD ----
  // useEffect runs once when the component first appears on screen
  useEffect(() => {
    loadTasks();
  }, []); // Empty array [] means "run only once"

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await fetchTasks(); // Call our api.js function
      setTasks(data);
    } catch (err) {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  // ---- ADD A NEW TASK ----
  async function handleAddTask() {
    if (!newTitle.trim()) {
      setError("Please enter a task title.");
      return;
    }
    try {
      setError("");
      const created = await createTask(newTitle);
      setTasks([created, ...tasks]); // Add new task to the TOP of the list
      setNewTitle("");               // Clear the input field
    } catch (err) {
      setError("Failed to add task.");
    }
  }

  // Allow pressing Enter to add a task
  function handleKeyDown(e) {
    if (e.key === "Enter") handleAddTask();
  }

  // ---- TOGGLE TASK COMPLETE / INCOMPLETE ----
  async function handleToggle(task) {
    try {
      const updated = await updateTask({ ...task, completed: !task.completed });
      // Replace the old task in the list with the updated one
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError("Failed to update task.");
    }
  }

  // ---- DELETE A TASK ----
  async function handleDelete(taskId) {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId)); // Remove from list
    } catch (err) {
      setError("Failed to delete task.");
    }
  }

  // ---- START EDITING A TASK ----
  function handleStartEdit(task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  // ---- SAVE EDITED TASK ----
  async function handleSaveEdit(task) {
    if (!editingTitle.trim()) return;
    try {
      const updated = await updateTask({ ...task, title: editingTitle });
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
      setEditingId(null); // Exit edit mode
    } catch (err) {
      setError("Failed to save edit.");
    }
  }

  // ---- FILTER + SORT TASKS ----
  // This creates a new array based on current filter and sort settings
  const visibleTasks = tasks
    .filter((task) => {
      if (filter === "completed") return task.completed === 1;
      if (filter === "pending")   return task.completed === 0;
      return true; // "all" — show everything
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return b.created_at - a.created_at;
      return a.created_at - b.created_at; // oldest first
    });

  // ---- RENDER ----
  return (
    // Apply "dark" class to root when dark mode is on
    <div className={`app ${darkMode ? "dark" : ""}`}>

      {/* ---- HEADER ---- */}
      <header className="header">
        <div className="header-left">
          <span className="app-icon">✅</span>
          <h1 className="app-title">My To-Do List</h1>
        </div>
        <button
          className="dark-toggle"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle dark mode"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      {/* ---- MAIN CONTENT ---- */}
      <main className="main">

        {/* ---- ERROR MESSAGE ---- */}
        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button className="dismiss-btn" onClick={() => setError("")}>✕</button>
          </div>
        )}

        {/* ---- ADD TASK INPUT ---- */}
        <div className="add-task-row">
          <input
            className="task-input"
            type="text"
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="add-btn" onClick={handleAddTask}>
            + Add Task
          </button>
        </div>

        {/* ---- FILTER & SORT CONTROLS ---- */}
        <div className="controls-row">
          {/* Filter buttons */}
          <div className="filter-group">
            {["all", "pending", "completed"].map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {/* Capitalize first letter */}
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <select
            className="sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* ---- TASK STATS ---- */}
        <div className="stats-row">
          <span>{tasks.filter((t) => t.completed === 0).length} pending</span>
          <span>·</span>
          <span>{tasks.filter((t) => t.completed === 1).length} completed</span>
          <span>·</span>
          <span>{tasks.length} total</span>
        </div>

        {/* ---- TASK LIST ---- */}
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : visibleTasks.length === 0 ? (
          <div className="empty-state">
            {filter === "all"
              ? "🎉 No tasks yet! Add one above."
              : `No ${filter} tasks.`}
          </div>
        ) : (
          <ul className="task-list">
            {visibleTasks.map((task) => (
              <li key={task.id} className={`task-card ${task.completed ? "done" : ""}`}>

                {/* ---- CHECKBOX ---- */}
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={task.completed === 1}
                  onChange={() => handleToggle(task)}
                />

                {/* ---- TASK TITLE (or edit input) ---- */}
                {editingId === task.id ? (
                  <input
                    className="edit-input"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(task);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <span className={`task-title ${task.completed ? "strikethrough" : ""}`}>
                    {task.title}
                  </span>
                )}

                {/* ---- ACTION BUTTONS ---- */}
                <div className="task-actions">
                  {editingId === task.id ? (
                    <>
                      <button className="save-btn" onClick={() => handleSaveEdit(task)}>💾</button>
                      <button className="cancel-btn" onClick={() => setEditingId(null)}>✕</button>
                    </>
                  ) : (
                    <>
                      <button
                        className="edit-btn"
                        onClick={() => handleStartEdit(task)}
                        title="Edit task"
                      >✏️</button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(task.id)}
                        title="Delete task"
                      >🗑️</button>
                    </>
                  )}
                </div>

              </li>
            ))}
          </ul>
        )}

      </main>

      {/* ---- FOOTER ---- */}
      <footer className="footer">
        Built with React + FastAPI + SQLite
      </footer>

    </div>
  );
}

export default App;
