# restaurant-pos-system

A full-stack Restaurant Point of Sale (POS) System designed to streamline restaurant operations, including menu management, order processing, customer CRM, loyalty programs, and revenue reporting. The system supports role-based access for admins, staff, and customers, with a mobile-friendly customer ordering experience.

---

## Features

### User Roles

- Admin / Staff (Desktop): Manage restaurant operations
- Customer (Mobile): Place orders and view menu

### Admin & Staff Dashboard

- Menu management (Create, Read, Update, Delete)
- Order management and tracking
- Customer CRM (points, spending, order history)
- Discounts and loyalty points management
- Revenue and sales reports
- Upload menu item images
- Sales report and inventory forecasting (exponential smoothing)

### Customer Side

- View digital menu and place orders 
- Optional remarks, pre-order
- Earn and use membership points
- View and modify profile
- View detailed ordering history
- Submit feedbacks

---

## Tech Stack

### Frontend

- React
- Ant Design (UI components)
- CSS

### Backend

- Node.js
- Express.js

### Database

- MySQL

### Other Tools and Libraries

- Multer – file uploads (menu item images)
- CORS – cross-origin requests
- dotenv – environment variable management

---

### Environment Variables

## Backend
Create .env file under backend directory and configure the following:
PORT=3000
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
ALLOWED_ORIGINS=http://localhost:3001

## Frontend
Create .env file under frontend directory and configure the following:
REACT_APP_API_BASE=http://localhost:3000

## Prerequisites

Ensure the following are installed on your system before running the project:

- Node.js (v16 or later)
- npm (comes with Node.js)
- MySQL Server
- Git


### Backend Setup
cd backend
npm install
npm start

### Frontend Setup
cd frontend
npm install
npm start
