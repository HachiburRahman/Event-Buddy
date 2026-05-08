# Event Buddy - Backend API

This is the backend for the Event Buddy application, a full-stack event booking platform. It is built with **NestJS**, **TypeScript**, and **PostgreSQL**.

## Features

-   **JWT Authentication:** Secure endpoints with role-based access control (Admin vs. User).
-   **Strong Validation:** Enforces `@gmail.com` emails and strong passwords (uppercase, lowercase, number, special character, 8+ length).
-   **Admin Event Management:** Full CRUD (Create, Read, Update, Delete) functionality for events, including image uploads.
-   **Public Event Listings:** Publicly accessible endpoints for upcoming and past events with pagination.
-   **User Booking System:** Secure booking and cancellation system with robust validation (seat availability, event dates).
-   **Dynamic Seat Calculation:** All event endpoints provide real-time `bookedSeats` and `spotsLeft` data.

---

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/)
-   [PostgreSQL](https://www.postgresql.org/download/) running locally
-   [pgAdmin 4](https://www.pgadmin.org/download/) (Recommended for database management)

### 1. Setup

**Clone the repository:**
```bash
git clone https://github.com/JALAL-00/Event-Buddy-Event-Management-System.git
```

**Navigate to the backend project folder:**
```bash
cd Event-Buddy-Event-Management-System/backend
```

**Install dependencies:**
```bash
npm install
```

### 2. Set Up Environment
**Set Up Environment Variables:**
    Create a `.env` file in the `/backend` directory with the following content. **Make sure to update these values to match your local PostgreSQL configuration.**
    
    # backend/.env

    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_USERNAME=postgres
    DATABASE_PASSWORD=your_postgres_password_here
    DATABASE_NAME=eventbuddy

    JWT_SECRET=a8b3c1d9e7f5a2b8d4e6f3a1c9d8b7c6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0
    JWT_EXPIRES_IN=1d


### 3. Database Setup

1.  Open **pgAdmin 4**.
2.  Connect to your local PostgreSQL server.
3.  **Drop** any existing `eventbuddy` database.
4.  Right-click on `Databases` -> `Create` -> `Database...`.
5.  Enter `eventbuddy` as the Database name and click Save.
6.  The application will automatically create the necessary tables when it first starts (`synchronize: true` is enabled for development).

### 4. Running the Application

```bash
npm run start:dev
```
The server will start on `http://localhost:3000`. The first time it runs, it will automatically seed the database with an Admin account.

**Default Admin Credentials:**
-   **Email:** `admin.jalal@gmail.com`
-   **Password:** `AdminJalal123@`

_Note: To change the default admin credentials, edit the variables in `backend/src/seed/seed.service.ts` and reset the database._

---

## 🧪 API Testing with Postman

To facilitate easy testing of all API endpoints, a pre-configured Postman collection is provided. This collection includes requests for all major features.

1.  **Download the Collection:** Download the Postman collection JSON file from the following link:
    [**Event Buddy Postman Collection**](https://drive.google.com/drive/folders/1_j6q3yYxdvPbcTDGrRC-8WVg3JHRu9qI?usp=sharing)

2.  **Import:** Open Postman and click the **Import** button. Drag & Drop the file Don't need to change anything, everythig is managed propery(by folder) just open and Test Accordingly step-3 instructions.

3.  **Workflow for Protected Routes:** Most routes require a JWT for    authorization. Here is the manual workflow:
    a. First Run User registration Then Run the **Login User** or **Login Admin** request first (found in the `Auth` folder).
    b. Copy the `access_token` from the JSON response.
    c. For any protected request (e.g., `Create Event`), go to the **Authorization** tab.
    d. Select **Type: Bearer Token** and paste the copied token into the "Token" field on the right.

---

##  API Endpoints

A brief overview of the available API routes, all of which are pre-configured in the provided Postman collection.

### `Auth`

-   `POST /auth/register`: Register a new user.
-   `POST /auth/login`: Log in a user or admin, returns a JWT `access_token`.
-   `GET /auth/profile`: [USER] Get the profile of the logged-in user.

### `Events`

-   `GET /events/upcoming`: [PUBLIC] Get a paginated list of upcoming events.
-   `GET /events/past`: [PUBLIC] Get a paginated list of past events.
-   `POST /events/public/find`: [PUBLIC] Get details of a single event by its ID.
-   `GET /events`: [ADMIN] Get a list of all events with registration counts.
-   `POST /events`: [ADMIN] Create a new event (requires `multipart/form-data` for image upload).
-   `PATCH /events`: [ADMIN] Update an event.
-   `DELETE /events`: [ADMIN] Delete an event.

### `Bookings`

-   `POST /bookings`: [USER] Book seats for an event.
-   `GET /bookings/my-bookings`: [USER] Get a list of all bookings for the current user.
-   `DELETE /bookings/cancel`: [USER] Cancel a specific booking.
