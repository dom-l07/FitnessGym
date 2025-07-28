# Fitness Gym Management System

A comprehensive web application for managing fitness gym operations including member registration, class bookings, billing, profile management, and administrative functions. Built with modern web technologies and featuring a responsive, accessible design with optimized code architecture.

## ✨ Features

### 👤 Member Features
- **User Registration & Authentication**: Secure member registration and login system with comprehensive form validation
- **Profile Management**: Complete profile editing with profile picture upload functionality and secure file handling
- **User Dashboard**: Personalized dashboard with statistics display, active booking filtering, and streamlined layout
- **Location Browsing**: View available gym locations with detailed information and contact details
- **Room Information**: Browse available rooms and facilities with enhanced visual presentation
- **Class Listings**: View fitness classes with real-time availability tracking and smart booking system
- **Booking Management**: Book and manage fitness class reservations with intuitive interface and advanced filtering
- **Billing System**: View billing information and membership plans with perfectly aligned pricing cards

### 🔧 Admin Features
- **Admin Dashboard**: Comprehensive overview of gym operations with optimized statistics cards and analytics
- **Member Management**: Manage member accounts with enhanced delete functionality and nested callbacks
- **Class Administration**: Create and manage fitness classes with capacity monitoring
- **Location Management**: Manage gym locations and facilities with image upload support
- **System Settings**: Configure application settings and preferences

### 🆕 Latest Enhancements (v2.1)
- **Code Optimization**: Extensively refactored codebase with 200+ lines reduction while maintaining full functionality
- **Enhanced Booking System**: Active booking filtering, improved count accuracy, and streamlined user experience
- **UI/UX Improvements**: Black text styling for better contrast, optimized card layouts, and consistent spacing
- **Database Optimizations**: Improved query efficiency, consolidated database operations, and better error handling
- **Clean Architecture**: Removed unnecessary code, consolidated CSS rules, and implemented DRY principles
- **Helper Functions**: Added reusable functions for database operations and error handling

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js framework (optimized with helper functions and consolidated routes)
- **Database**: MySQL with enhanced schema, optimized queries, and improved error handling
- **View Engine**: EJS (Embedded JavaScript) with Bootstrap 5.3.3 and optimized CSS
- **Authentication**: Express Session with Flash messaging system
- **File Upload**: Multer with comprehensive image validation, security, and simplified configuration
- **Environment Management**: dotenv for secure configuration
- **Frontend**: Bootstrap 5.3.3, Bootstrap Icons, fully responsive design with streamlined CSS
- **Code Architecture**: Clean code principles with DRY implementation and modular structure
- **Performance**: Optimized database queries, consolidated functions, and reduced code complexity

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
├── views/               # EJS templates with enhanced accessibility
    ├── billings.ejs     # Billing page with aligned membership plan cards
    ├── bookings.ejs     # Booking management page
    ├── classes.ejs      # Class listings with animated progress bars
    ├── index.ejs        # Homepage
    ├── locations.ejs    # Dynamic location listings from database
    ├── rooms.ejs        # Room information page
    ├── afterloginejs/   # Protected member pages
    │   ├── editProfile.ejs    # Profile editing with picture upload
    │   ├── userDashboard.ejs  # Dashboard with fixed-height cards
    │   └── billings.ejs       # Member billing with perfect button alignment
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
        └── navbar.ejs   # Enhanced navigation with profile dropdown
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
- `GET /afterloginejs/userDashboard` - Streamlined dashboard with active booking filtering and optimized statistics
- `GET /afterloginejs/editProfile` - Profile editing page with secure picture upload
- `POST /afterloginejs/editProfile` - Update profile and upload profile picture with validation
- `GET /afterloginejs/billings` - Enhanced billing page with improved card styling and better contrast
- `GET /bookings` - Advanced booking management with active filtering and improved user experience
- `POST /book-class` - Book fitness classes with availability checking and conflict prevention
- `POST /cancel-booking` - Cancel bookings with proper validation and database cleanup
- `GET /classes` - Interactive class listings with real-time availability and enhanced booking flow

### Admin Routes (Requires Admin Access)
- `GET /admin/dashboard` - Comprehensive admin dashboard with optimized statistics cards
- `GET /admin/members` - Enhanced member management with improved delete functionality
- `POST /admin/delete-member` - Secure member deletion with proper database cleanup
- `GET /admin/classes` - Class administration with capacity monitoring
- `GET /admin/locations` - Location management with image upload support
- `GET /admin/settings` - System configuration and preferences

## 🎯 Features Implementation Status

### ✅ COMPLETED & OPTIMIZED (v2.1):
- **Core Application Structure**: Optimized Express.js server with consolidated routes and helper functions
- **Code Architecture**: Extensively refactored with 200+ lines reduction while maintaining full functionality
- **User Authentication System**: Complete registration, login, logout with secure session management
- **Database Integration**: MySQL connection with optimized queries and improved error handling
- **Enhanced Booking System**: Active booking filtering, accurate count display, and streamlined user experience
- **Profile Management**: Full-featured profile editing with secure picture upload and validation
- **Optimized User Dashboard**: Streamlined layout with active booking filtering and improved statistics
- **Advanced Admin Features**: Enhanced member management with proper delete functionality and nested callbacks
- **UI/UX Improvements**: Black text styling for better contrast, optimized card layouts, and consistent spacing
- **Clean CSS**: Consolidated style rules, removed duplicates, and optimized animations
- **Helper Functions**: Added reusable database functions (handleDbError, initRenderData, getUserId)
- **Performance Optimization**: Reduced code complexity while maintaining all features and functionality

### 🔧 TECHNICAL OPTIMIZATIONS (v2.1):
- **Code Reduction & Optimization**: 
  - Extensive refactoring reducing app.js by 200+ lines while maintaining full functionality
  - Simplified multer configuration with ternary operators and streamlined logic
  - Consolidated route handlers with reduced verbosity and improved patterns
  - Added helper functions for database operations and error handling
  - Removed redundant code and implemented DRY principles throughout

- **Database Optimizations**:
  - Consolidated database queries with improved efficiency
  - Enhanced error handling with reusable handleDbError function
  - Optimized booking system with active filtering and accurate count display
  - Improved member deletion with proper nested callback structure
  - Streamlined connection management and query execution

- **UI/UX Enhancements**:
  - Black text styling for improved contrast and readability
  - Optimized card layouts with consistent spacing and visual hierarchy
  - Enhanced booking system with active status filtering
  - Improved admin dashboard with properly spaced statistics cards
  - Consolidated CSS rules removing duplicates and optimizing animations

- **Performance Improvements**:
  - Reduced file size and complexity while maintaining all features
  - Optimized middleware functions with early returns and streamlined logic
  - Improved route handler efficiency with consolidated patterns
  - Enhanced session management and authentication flow
  - Better memory usage through code optimization and cleanup

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
- **Supported Formats**: JPEG, PNG, GIF with comprehensive validation
- **File Size Limit**: 5MB per file with user-friendly error messages
- **Naming Convention**: Timestamp-based unique filenames preventing conflicts
- **Security Features**: File type validation, sanitized filename generation, secure storage paths

### UI/UX Configuration:
- **Dashboard Layout**: Fixed-height cards (400px top row, 300px bottom row) for visual consistency
- **Progress Bars**: Data-attribute driven with JavaScript animation for smooth user experience
- **Button Alignment**: Flexbox-based alignment system using Bootstrap utilities (d-flex, flex-column, mt-auto)
- **Accessibility**: WCAG-compliant forms with visually-hidden labels and proper ARIA attributes
- **Responsive Design**: Mobile-first approach with Bootstrap 5.3.3 breakpoints and grid system

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

**Note**: This application represents a comprehensive fitness gym management system built for educational purposes as part of the C237 Software Application Development course. The system demonstrates modern web development practices including responsive design, accessibility compliance, secure file handling, and user-centered design principles. All security measures and best practices have been implemented to ensure a production-ready foundation.

## 📊 Recent Updates

### Version 2.1 Major Optimizations (Current):
- ✅ **Code Architecture Overhaul**: Reduced app.js by 200+ lines while maintaining full functionality
- ✅ **Database Optimization**: Consolidated queries, improved error handling, and enhanced performance
- ✅ **Booking System Enhancement**: Active filtering, accurate counts, and streamlined user experience
- ✅ **UI/UX Refinements**: Black text styling, improved contrast, and optimized card layouts
- ✅ **CSS Optimization**: Consolidated rules, removed duplicates, and improved animations
- ✅ **Helper Functions**: Added reusable database operations and error handling functions
- ✅ **Admin Improvements**: Enhanced member management with proper delete functionality
- ✅ **Performance Gains**: Reduced complexity while maintaining all features and functionality

### Version 2.0 Foundation Features:
- ✅ **Profile Picture System**: Complete implementation with secure upload and fallback handling
- ✅ **Dashboard Design**: Fixed-height cards with centered content and improved visual hierarchy  
- ✅ **Interactive Elements**: Real-time class availability display with smooth animations
- ✅ **Accessibility Compliance**: WCAG-compliant forms with enhanced screen reader support
- ✅ **Visual Consistency**: Uniform button alignment and consistent spacing across all components
- ✅ **Responsive Design**: Mobile-first approach with improved cross-device compatibility

### Technical Achievements:
- **Code Quality**: Implemented clean code principles with DRY methodology and modular architecture
- **Performance**: Optimized database operations with efficient query patterns and connection management
- **Security**: Enhanced file upload validation, secure session handling, and input sanitization
- **Maintainability**: Consolidated codebase with reusable functions and improved documentation
- **User Experience**: Streamlined workflows with intuitive interfaces and responsive feedback systems