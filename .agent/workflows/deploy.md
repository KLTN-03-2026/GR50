---
description: Guide to deploying the MediSchedule application
---

# Deployment Workflow

This workflow guides you through deploying the MediSchedule application to a public server.

## 1. Database Deployment (MySQL)
1.  **Choose a Provider**: Railway, Aiven, or PlanetScale.
2.  **Provision**: Create a new MySQL database instance.
3.  **Credentials**: Note down the Host, Port, User, Password, and Database Name.

## 2. Backend Deployment (Node.js)
1.  **Choose a Provider**: Render or Railway.
2.  **Connect Repo**: Connect your GitHub repository.
3.  **Configuration**:
    -   Root Directory: `backend`
    -   Build Command: `npm install`
    -   Start Command: `node server.js`
4.  **Environment Variables**:
    -   `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`: From Step 1.
    -   `JWT_SECRET`: A secure random string.
    -   `GEMINI_API_KEY`: Your Gemini API key.

## 3. Frontend Deployment (React)
1.  **Choose a Provider**: Vercel or Netlify.
2.  **Connect Repo**: Connect your GitHub repository.
3.  **Configuration**:
    -   Root Directory: `frontend`
    -   Framework Preset: Create React App
4.  **Environment Variables**:
    -   `REACT_APP_BACKEND_URL`: The URL of your deployed backend (e.g., `https://your-backend.onrender.com`).

## 4. Verification
1.  Visit the frontend URL.
2.  Test registration and login.
3.  Check backend logs if issues arise.
