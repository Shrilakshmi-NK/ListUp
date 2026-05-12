// ============================================================
// FILE: frontend/src/api.js
// PURPOSE: All communication with the FastAPI backend lives here.
//          This keeps App.js clean and easy to read.
// ============================================================

// The base URL of your FastAPI backend
const API_URL = "http://localhost:8000";

// --- Fetch all tasks from the backend ---
export async function fetchTasks() {
  const response = await fetch(`${API_URL}/tasks`);
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return response.json(); // Returns an array of task objects
}

// --- Create a new task ---
// taskTitle is a string like "Buy groceries"
export async function createTask(taskTitle) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: taskTitle }), // Send title as JSON
  });
  if (!response.ok) throw new Error("Failed to create task");
  return response.json(); // Returns the newly created task object
}

// --- Update a task (toggle complete OR edit title) ---
// task is the full task object with updated fields
export async function updateTask(task) {
  const response = await fetch(`${API_URL}/tasks/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: task.title,
      completed: task.completed, // true or false
    }),
  });
  if (!response.ok) throw new Error("Failed to update task");
  return response.json(); // Returns the updated task object
}

// --- Delete a task by its ID ---
export async function deleteTask(taskId) {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete task");
  return response.json(); // Returns { message: "Task deleted successfully" }
}
