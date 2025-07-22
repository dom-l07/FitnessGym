# Fitness Gym Management System

A comprehensive web application for managing fitness gym operations including member registration, class bookings, billing, and administrative functions.

## Features

### Member Features
- **User Registration & Authentication**: Secure member registration and login system
- **Location Browsing**: View available gym locations
- **Room Information**: Browse available rooms and facilities
- **Class Listings**: View fitness classes and schedules
- **Booking Management**: Book and manage fitness class reservations
- **Billing System**: View and manage billing information

### Admin Features
- **Admin Dashboard**: Comprehensive overview of gym operations
- **Member Management**: Manage member accounts and information
- **Class Administration**: Create and manage fitness classes
- **Location Management**: Manage gym locations and facilities
- **System Settings**: Configure application settings

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **View Engine**: EJS (Embedded JavaScript)
- **Authentication**: Express Session with Flash messages
- **File Upload**: Multer for image handling
- **Environment Variables**: dotenv for configuration

## Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- MySQL Server
- npm (Node Package Manager)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FitnessGym
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=fitness_gym_db
   SESSION_SECRET=your_secret_key_here
   ```

4. **Set up the database**
   - Create a MySQL database named `fitness_gym_db`
   - Run the database scripts from the `database-script` folder (when available)

5. **Start the application**
   ```bash
   node app.js
   ```

6. **Access the application**
   Open your web browser and navigate to `http://localhost:3000`

## Project Structure

```
FitnessGym/
├── app.js                 # Main application file
├── package.json          # Project dependencies and scripts
├── .env                  # Environment variables (create this)
├── database-script/      # Database setup scripts
├── public/               # Static files
│   ├── css/
│   │   └── style.css    # Application styles
│   └── images/          # Image uploads and assets
│       └── background.jpg
└── views/               # EJS templates
    ├── billings.ejs     # Billing page
    ├── bookings.ejs     # Booking management
    ├── classes.ejs      # Class listings
    ├── index.ejs        # Homepage
    ├── locations.ejs    # Location listings
    ├── rooms.ejs        # Room information
    ├── admin/           # Admin pages
    │   ├── classes.ejs
    │   ├── dashboard.ejs
    │   ├── locations.ejs
    │   ├── members.ejs
    │   └── settings.ejs
    ├── auth/            # Authentication pages
    │   ├── login.ejs
    │   └── register.ejs
    └── partials/        # Reusable components
        └── navbar.ejs
```

## API Endpoints

### Public Routes
- `GET /` - Homepage
- `GET /locations` - View gym locations
- `GET /rooms` - View available rooms
- `GET /classes` - View fitness classes
- `GET /register` - Registration page
- `POST /register` - Process registration
- `GET /login` - Login page
- `POST /login` - Process login
- `GET /logout` - User logout

### Protected Routes (Requires Authentication)
- `GET /bookings` - View user bookings
- `GET /billings` - View billing information

### Admin Routes (Requires Admin Access)
- `GET /dashboard` - Admin dashboard

## Development Status

### COMPLETED:
- Basic application structure
- User authentication system
- Database connection setup
- View templates for all main pages
- Session management
- File upload functionality

### IN-PROGRESS:
- Database schema implementation
- Complete CRUD operations for all entities
- Admin functionality implementation
- Booking system logic
- Billing system integration

### BLOCKING:
- Dummy data not added
- Testing and validation

## Dependencies

- **express**: Web application framework
- **mysql2**: MySQL database driver
- **ejs**: Template engine
- **express-session**: Session management
- **connect-flash**: Flash messages
- **multer**: File upload handling
- **dotenv**: Environment variable management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Contact

For questions or support, please contact the development team.