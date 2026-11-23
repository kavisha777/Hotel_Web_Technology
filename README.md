
# Coastal Haven – Jaffna

## Coastal Villa and Room Booking System

A dynamic web-based accommodation booking system developed as an individual Web Technologies project.

## Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Bootstrap 5
- Axios
- React Router DOM

### Backend
- PHP 8.2
- Laravel 12
- Laravel Sanctum REST API

### Database
- MySQL

## Main Features

### Guest Features
- View available rooms.
- Search room availability using check-in and check-out dates.
- Select the number of guests.
- Register and log in.
- Book rooms online.
- View booking history.
- Cancel bookings.

### Administrator Features
- Administrator authentication.
- Add new rooms.
- Edit room details.
- Upload room images.
- Delete rooms.
- View customer bookings.
- Confirm or cancel bookings.

### Security Features
- Password hashing.
- Token-based authentication.
- Role-based administrator access.
- Server-side input validation.
- Protected API routes.
- Booking overlap prevention.

## Project Structure

```text
Hotel Project/
│
├── backend/
│   ├── app/
│   ├── bootstrap/
│   ├── database/
│   ├── routes/
│   └── storage/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
│
├── README.md
└── db_structure.sql
```

## Installation Instructions

### 1. Requirements

Install the following:
- Node.js
- PHP 8.2 or later compatible with the Laravel version
- Composer
- MySQL
- XAMPP

### 2. Database Setup

1. Start Apache and MySQL using XAMPP.
2. Open phpMyAdmin.
3. Create a database named `coastal_haven_db`.
4. Import `db_structure.sql`.

### 3. Backend Setup

Open a terminal:

```bash
cd backend
composer install
```

Configure the `.env` file:

```env
APP_NAME="Coastal Haven"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=coastal_haven_db
DB_USERNAME=root
DB_PASSWORD=
```

Run:

```bash
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan db:seed --class=RoomSeeder
php artisan db:seed --class=AdminSeeder
php artisan serve
```

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend in your browser:

http://localhost:5173

Backend API:

http://127.0.0.1:8000/api

## Administrator Account

Development account:

Email: admin@coastalhaven.com

Password: ChangeThisAdminPassword123!

Change the development password before any real deployment.

## Database Tables

- users
- rooms
- bookings
- personal_access_tokens (Laravel Sanctum)

## Author

Individual Web Technologies Project

## Project Name

Coastal Haven – Jaffna
```

## Stage 11 – Export your database

Now open:

`http://localhost/phpmyadmin`

1. Select `coastal_haven_db`.
2. Click **Export**.
3. Select **Quick**.
4. Choose **SQL** as the format.
5. Click **Export**.
6. Save the downloaded file as `db_structure.sql` in your main `Hotel Project` folder.

<badge color="success">Documentation step completed</badge>

Next, we will prepare the final project report and then perform the complete application testing.

*Improved English: “What should I do next?”*