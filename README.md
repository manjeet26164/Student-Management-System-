<<<<<<< HEAD
# University ERP Portal (MERN)

A complete full-stack university ERP portal with role-based modules for Student, Faculty, and Admin.

## Tech Stack

- Frontend: React + React Router + Axios + plain CSS
- Backend: Node.js + Express + JWT + bcrypt
- Database: MongoDB + Mongoose

## Project Structure

- client
  - src/components
  - src/context
  - src/layouts
  - src/pages
  - src/services
  - src/styles
- server
  - src/config
  - src/controllers
  - src/middleware
  - src/models
  - src/routes
  - src/seed
  - src/utils

## Environment Setup

### Server env

1. Copy `server/.env.example` to `server/.env`
2. Update values if needed:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/university_erp
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Client env

1. Copy `client/.env.example` to `client/.env`
2. Keep:

```env
VITE_API_URL=http://localhost:5000/api
```

## Install

```bash
cd server
npm install

cd ../client
npm install
```

## Seed Database

```bash
cd server
npm run seed
```

Seeded demo users:

- Student: `STU23001` / `Student@123`
- Faculty: `FAC2101` / `Faculty@123`
- Admin: `ADM1001` / `Admin@123`

## Run Application

Start backend:

```bash
cd server
npm run dev
```

Start frontend:

```bash
cd client
npm run dev
```

Open: `http://localhost:5173`

## Main Features

- JWT login with role tabs (Student / Faculty / Admin)
- Protected routes and role authorization
- Password hashing and change-password flow
- Student portal: dashboard, profile, results, attendance, fee details
- Faculty portal: assigned students/classes, attendance, marks, records
- Admin portal: manage students, manage subjects, marks/attendance/fee operations
- Premium dark academic UI with navy-gold visual system

## Validation Done

- Frontend build successful (`npm run build` in `client`)
- Backend app module syntax validated (`node -e "require('./src/app')"` in `server`)
=======
# Student-Management-System-
>>>>>>> 65bfe5eb3ad822345e29652344fef94873f33c2c
