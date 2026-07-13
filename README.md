# University ERP Portal (MERN)

A full-stack university ERP portal with role-based modules for Student, Faculty, and Admin.

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express, JWT (httpOnly cookie auth), bcrypt
- **Database**: MongoDB, Mongoose
- **Security**: Helmet, rate limiting on auth routes, Zod input validation

## Features

- Role-based login (Student / Faculty / Admin) with JWT stored in httpOnly cookies
- Protected routes and role-based authorization middleware
- Rate-limited login (brute-force protection) and Zod schema validation
- Password hashing (bcrypt) and change-password flow
- Student portal: dashboard, profile, results, attendance, fee details
- Faculty portal: assigned students/classes, attendance, marks
- Admin portal: manage students (paginated), manage subjects, marks/attendance/fee operations

## Project Structure

```
client/
  src/components, context, layouts, pages, services, styles
server/
  src/config, controllers, middleware, models, routes, seed, utils, validators
```

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env
```

Update `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/university_erp
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 2. Client

```bash
cd client
npm install
cp .env.example .env
```

Update `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed demo data

```bash
cd server
npm run seed
```

| Role    | Login ID   | Password      |
|---------|------------|---------------|
| Student | STU23001   | Student@123   |
| Faculty | FAC2101    | Faculty@123   |
| Admin   | ADM1001    | Admin@123     |

### 4. Run

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

Open `http://localhost:5173`

## Notes

- Auth token is stored as an httpOnly cookie (not localStorage) to reduce XSS risk.
- Admin's student list endpoint is paginated (`?page=&limit=`).