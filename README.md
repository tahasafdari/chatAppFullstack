# Chat Fullstack Application

A real-time chat application built with React, Express, MongoDB, and WebSockets.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Material-UI
- **Backend:** Node.js, Express, Mongoose, WebSocket (ws)
- **Auth:** JWT with HTTP-only cookies, bcryptjs

## Getting Started

### Prerequisites

- Node.js
- MongoDB instance

### Setup

1. **Backend**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in `backend/`:

   ```
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLIENT_URL=http://localhost:5173
   ```

   ```bash
   node index.js
   ```

   Server runs on `http://localhost:4000`.

2. **Frontend**

   ```bash
   cd client
   npm install
   npm run dev
   ```

   App runs on `http://localhost:5173`.

## Features

- User registration and login with JWT authentication
- Real-time online user presence via WebSocket
- Responsive UI with Tailwind CSS and Material-UI icons
