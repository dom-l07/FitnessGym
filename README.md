# Fitness Gym Management System

A comprehensive web application for managing fitness gym operations including member registration, class bookings, billing, profile management, and administrative functions.

## ✨ Features

### 👤 Member Features
- **User Registration & Authentication**: Secure member registration and login system with form validation
- **Profile Management**: Complete profile editing with profile picture upload functionality
- **User Dashboard**: Personalized dashboard showing bookings, billing, and quick actions
- **Location Browsing**: View available gym locations with detailed information and contact details
- **Room Information**: Browse available rooms and facilities
- **Class Listings**: View fitness classes and schedules
- **Booking Management**: Book and manage fitness class reservations
- **Billing System**: View and manage billing information with payment tracking

### 🔧 Admin Features
- **Admin Dashboard**: Comprehensive overview of gym operations with analytics
- **Member Management**: Manage member accounts and information
- **Class Administration**: Create and manage fitness classes
- **Location Management**: Manage gym locations and facilities
- **System Settings**: Configure application settings

### 🆕 New Features
- **Profile Picture Upload**: Members can upload and change their profile pictures
- **Dynamic Location Display**: Location data fetched from database with fallback support
- **Enhanced User Experience**: Improved navigation, responsive design, and user feedback
- **File Upload Security**: Image validation, file size limits, and secure file handling
- **Fallback Image Handling**: Graceful handling of missing or broken profile pictures

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL with enhanced schema
- **View Engine**: EJS (Embedded JavaScript) with Bootstrap 5
- **Authentication**: Express Session with Flash messages
- **File Upload**: Multer with image validation and unique filename generation
- **Environment Variables**: dotenv for secure configuration
- **Frontend**: Bootstrap 5, Bootstrap Icons, responsive design

## 📋 Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
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
   - Run the database creation script from the `database-script/dbscript.sql` file
   - **For existing databases**: Run the profile picture migration script to add the new column:
     ```sql
     ALTER TABLE members ADD COLUMN profile_picture VARCHAR(255) DEFAULT 'default-profile.png';
     ```

5. **Create required directories**
   ```bash
   mkdir -p public/uploads/profile-pictures
   ```
   - Add a default profile picture (`default-profile.png`) to `public/uploads/profile-pictures/`

6. **Start the application**
   ```bash
   node app.js
   ```

7. **Access the application**
   Open your web browser and navigate to `http://localhost:3000`

## Project Structure

```
FitnessGym/
├── app.js                 # Main application file with enhanced routes
├── package.json          # Project dependencies and scripts
├── .env                  # Environment variables (create this)
├── database-script/      # Database setup scripts
│   └── dbscript.sql     # Main database creation script
├── public/               # Static files
│   ├── css/
│   │   └── style.css    # Application styles
│   ├── images/          # Static image assets
│   │   └── background.jpg
│   └── uploads/         # User uploaded files
│       └── profile-pictures/  # Profile picture uploads
└── views/               # EJS templates
    ├── billings.ejs     # Billing management page
    ├── bookings.ejs     # Booking management page
    ├── classes.ejs      # Class listings page
    ├── editProfile.ejs  # Profile editing with picture upload (NEW)
    ├── index.ejs        # Homepage
    ├── locations.ejs    # Dynamic location listings (ENHANCED)
    ├── rooms.ejs        # Room information page
    ├── userDashboard.ejs # User dashboard with stats (NEW)
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
        └── navbar.ejs   # Enhanced with profile dropdown
```

## 🚀 API Endpoints

### Public Routes
- `GET /` - Homepage with gym overview
- `GET /locations` - View gym locations (dynamic from database)
- `GET /rooms` - View available rooms and facilities
- `GET /classes` - View fitness classes and schedules
- `GET /register` - Member registration page
- `POST /register` - Process new member registration
- `GET /login` - Member login page
- `POST /login` - Process member authentication
- `GET /logout` - User logout and session cleanup

### Protected Member Routes (Requires Authentication)
- `GET /userDashboard` - Personalized member dashboard with stats
- `GET /editProfile` - Profile editing page with picture upload
- `POST /editProfile` - Update member profile and upload profile picture
- `GET /bookings` - View and manage user bookings
- `GET /billings` - View billing information and payment history

### Admin Routes (Requires Admin Access)
- `GET /admin/dashboard` - Comprehensive admin dashboard
- `GET /admin/members` - Member management interface
- `GET /admin/classes` - Class administration
- `GET /admin/locations` - Location management
- `GET /admin/settings` - System configuration

## 🎯 Features Implementation Status

### ✅ COMPLETED:
- **Core Application Structure**: Express.js server with MVC architecture
- **User Authentication System**: Registration, login, logout with session management
- **Database Integration**: MySQL connection with proper schema
- **Profile Management**: Complete profile editing with picture upload functionality
- **User Dashboard**: Comprehensive dashboard with statistics and quick actions
- **Dynamic Locations**: Location data rendered from database with fallback support
- **File Upload System**: Secure profile picture upload with validation and storage
- **Responsive Design**: Bootstrap 5 integration with mobile-friendly interfaces
- **Session Management**: Express sessions with flash messaging
- **Security Features**: Input validation, file type checking, secure file handling
- **Navigation Enhancement**: Dynamic navbar with user profile dropdown

### 🔧 ENHANCED FEATURES:
- **Profile Picture System**: 
  - Multer-based file upload with custom storage
  - Image validation (JPEG, PNG, GIF support)
  - File size limits and security checks
  - Automatic filename generation to prevent conflicts
  - Fallback to default image for missing pictures
- **User Dashboard**:
  - Profile sidebar with picture display
  - Statistics cards for bookings and billing
  - Recent activity summaries
  - Quick action buttons for common tasks
- **Location Management**:
  - Dynamic data fetching from database
  - Color-coded location cards
  - Contact information display
  - Features highlighting for each location

### 🚧 READY FOR DEVELOPMENT:
- **Booking System Logic**: Complete CRUD operations for class bookings
- **Billing System Integration**: Payment processing and invoice generation
- **Admin Functionality**: Full administrative control panels
- **Email Notifications**: Automated booking confirmations and reminders
- **Advanced Search**: Filter classes by type, time, instructor
- **Calendar Integration**: Visual calendar for class scheduling

## 🔧 Configuration Notes

### Environment Variables Required:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=fitness_gym_db
SESSION_SECRET=your_secret_key_here
```

### File Upload Configuration:
- **Upload Directory**: `public/uploads/profile-pictures/`
- **Supported Formats**: JPEG, PNG, GIF
- **File Size Limit**: 5MB per file
- **Naming Convention**: Timestamp-based unique filenames

### Database Schema Updates:
For existing databases, ensure the `members` table includes the new profile picture column:
```sql
ALTER TABLE members ADD COLUMN profile_picture VARCHAR(255) DEFAULT 'default-profile.png';
```

## 📦 Dependencies

### Core Dependencies:
- **express**: Web application framework for Node.js
- **mysql2**: MySQL database driver with enhanced features
- **ejs**: Embedded JavaScript template engine
- **express-session**: Session middleware for Express
- **connect-flash**: Flash message middleware
- **multer**: Multipart/form-data handling for file uploads
- **dotenv**: Environment variable management
- **path**: Node.js path utilities (built-in)

### Development Tools:
- **nodemon** (recommended): Auto-restart server during development
  ```bash
  npm install -g nodemon
  # Then run: nodemon app.js
  ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

---

**Note**: This application is designed for educational purposes as part of the C237 Software Application Development course. Ensure proper security measures are implemented before deploying to production environments.
- **dotenv**: Environment variable management

## Contact

For questions or support, please contact the development team.