# ============================================================
# FILE: backend/main.py
# PURPOSE: The entire backend — FastAPI server + SQLite database
# ============================================================

# --- Import required libraries ---
from fastapi import FastAPI, HTTPException   # FastAPI framework
from fastapi.middleware.cors import CORSMiddleware  # Allow frontend to talk to backend
from pydantic import BaseModel               # For data validation
import sqlite3                               # Built-in Python database
import time                                  # For timestamps

# --- Create the FastAPI app ---
app = FastAPI()

# --- Allow React frontend (running on port 3000) to access this backend ---
# Without this, the browser will block requests from React to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React's default port
    allow_credentials=True,
    allow_methods=["*"],   # Allow GET, POST, PUT, DELETE
    allow_headers=["*"],
)

# ============================================================
# DATABASE SETUP
# ============================================================

def get_db():
    """Open a connection to the SQLite database file."""
    conn = sqlite3.connect("todo.db")
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn

def init_db():
    """Create the tasks table if it doesn't already exist."""
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            title     TEXT    NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# Run database setup when the server starts
init_db()

# ============================================================
# DATA MODEL (What a task looks like when sent from frontend)
# ============================================================

class TaskCreate(BaseModel):
    """Defines what data we expect when creating a new task."""
    title: str

class TaskUpdate(BaseModel):
    """Defines what data we expect when updating a task."""
    title: str
    completed: bool

# ============================================================
# API ROUTES
# ============================================================

# --- GET /tasks → Return all tasks ---
@app.get("/tasks")
def get_tasks():
    conn = get_db()
    tasks = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()
    conn.close()
    # Convert each row to a plain dictionary so FastAPI can return it as JSON
    return [dict(task) for task in tasks]


# --- POST /tasks → Create a new task ---
@app.post("/tasks")
def create_task(task: TaskCreate):
    # Reject empty titles
    if not task.title.strip():
        raise HTTPException(status_code=400, detail="Task title cannot be empty")

    conn = get_db()
    timestamp = int(time.time())  # Unix timestamp (seconds since 1970)
    cursor = conn.execute(
        "INSERT INTO tasks (title, completed, created_at) VALUES (?, ?, ?)",
        (task.title.strip(), 0, timestamp)
    )
    conn.commit()

    # Fetch and return the newly created task
    new_task = conn.execute("SELECT * FROM tasks WHERE id = ?", (cursor.lastrowid,)).fetchone()
    conn.close()
    return dict(new_task)


# --- PUT /tasks/{id} → Update a task (title or completed status) ---
@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate):
    conn = get_db()

    # Check if the task exists
    existing = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")

    conn.execute(
        "UPDATE tasks SET title = ?, completed = ? WHERE id = ?",
        (task.title.strip(), int(task.completed), task_id)
    )
    conn.commit()

    # Return the updated task
    updated = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    conn.close()
    return dict(updated)


# --- DELETE /tasks/{id} → Delete a task ---
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    conn = get_db()

    # Check if the task exists
    existing = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")

    conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return {"message": "Task deleted successfully"}
