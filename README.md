# To-do-list

A clean and colorful to-do list web app built with React, FastAPI, and SQLite.

## Project Overview

This project is a simple task management app that allows you to:
- Add new tasks
- Mark tasks as completed or pending
- Edit and delete tasks
- Filter tasks by status
- Sort tasks by newest or oldest
- Toggle between light and dark mode

## Tech Stack

- Frontend: React (Create React App)
- Backend: FastAPI
- Database: SQLite
- API: REST endpoints for tasks

## Folder Structure

- `frontend/` - React application source code
- `backend/` - FastAPI server code and dependencies

## Setup Instructions

### Backend

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
5. The backend will run at `http://127.0.0.1:8000`.

### Frontend

1. Open a terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. The frontend will open at `http://localhost:3000`.

## Usage

1. Launch the backend server first.
2. Then start the React frontend.
3. Use the app to create, complete, edit, delete, filter, and sort your tasks.

## Deployment

The application is deployed on Vercel. You can access the live version at:

[https://to-do-list-ggrlmz5fu-shrilakshmi-s-listup.vercel.app/](https://to-do-list-ggrlmz5fu-shrilakshmi-s-listup.vercel.app/)

### Deployment Methods

- **Frontend**: Deployed using Vercel from the `frontend/` directory.
- **Backend**: The backend is not deployed separately in this setup; it runs locally or can be deployed to a platform like Heroku, Railway, or Render for production use.

## Notes

- Make sure the backend server is running before using the frontend so API requests can connect successfully.
- The app currently uses a local SQLite database for task storage.

Enjoy building and customizing your to-do list! 🚀
