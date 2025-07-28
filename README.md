# Fitness Gym Management System

A comprehensive web application for managing fitness gym operations including member registration, class bookings, bil- **GET /afterloginejs/billings` - Server-side billing management with form-based payment method handling and wallet operations
- **POST /billing/payment-methods` - Add payment methods via secure form submission with validation
- **POST /billing/payment-methods/:id/set-default` - Set default payment method through form submission
- **POST /billing/payment-methods/:id/delete` - Delete payment methods securely via form handling
- **POST /billing/add-funds` - Add funds to wallet through form submission with transaction tracking
- **POST /billing/select-plan` - Select membership plans via form with balance validation and automatic subscription
- **POST /billing/cancel-plan` - Cancel active membership plans through secure form submission
- **POST /billing/switch-plan` - Switch between membership plans with automatic cost adjustmenting, profile management, and administrative functions. Built with modern web technologies and featuring a responsive, accessible design with optimized code architecture.

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

### 🆕 Latest Enhancements (v2.2)
- **JavaScript Elimination**: Converted JavaScript-heavy billing system to server-side form submissions, reducing client-side code by 90%
- **Form-Based Architecture**: Replaced fetch API calls with traditional HTML forms for better server-side control and reliability
- **Direct SQL Operations**: Streamlined database operations with direct SQL queries, removing helper function abstraction layers
- **Enhanced Billing Features**: Complete payment method management, wallet transactions, and membership plan selection via forms
- **Optimized User Experience**: Maintained all functionality while simplifying client-side code and improving form accessibility
- **Clean Server-Side Logic**: Consolidated POST routes for form handling with comprehensive error management and validation

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js framework (optimized with direct database queries and form-based submissions)
- **Database**: MySQL with direct query patterns for maximum performance and transparency
- **View Engine**: EJS (Embedded JavaScript) with Bootstrap 5.3.3 and minimal client-side JavaScript
- **Authentication**: Express Session with Flash messaging system
- **File Upload**: Multer with comprehensive image validation, security, and simplified configuration
- **Environment Management**: dotenv for secure configuration
- **Frontend**: Bootstrap 5.3.3, Bootstrap Icons, fully responsive design with server-side form processing
- **Architecture**: Clean server-side patterns with direct SQL operations and form-based user interactions
- **Performance**: Minimal JavaScript usage with server-side processing for optimal loading and compatibility

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

### ✅ COMPLETED & OPTIMIZED (v2.2):
- **JavaScript Elimination**: Successfully converted billing system from JavaScript-heavy implementation to server-side forms
- **Form-Based Architecture**: Complete replacement of fetch API calls with traditional HTML form submissions
- **Direct Database Operations**: Streamlined SQL queries with direct database connections, removing helper function layers
- **Enhanced Billing System**: Full payment method management, wallet transactions, and membership plan operations via forms
- **Server-Side Processing**: All billing operations now handled server-side with comprehensive error handling and validation
- **Code Simplification**: Reduced client-side JavaScript by 90% while maintaining full functionality and improving accessibility
- **Optimized User Experience**: Form-based interactions provide better compatibility and server-side control
- **Clean Route Structure**: Consolidated POST routes for all form submissions with proper validation and error messaging

### 🔧 TECHNICAL OPTIMIZATIONS (v2.2):
- **JavaScript to SQL Conversion**: 
  - Complete elimination of client-side billing JavaScript (300+ lines reduced to ~30 lines)
  - Replaced JavaScript fetch operations with server-side form processing
  - Converted payment method management from AJAX to traditional form submissions
  - Moved plan selection logic from client-side JavaScript to server-side SQL operations

- **Form-Based Architecture**:
  - Traditional HTML forms for all billing operations ensuring better accessibility and compatibility
  - Server-side validation and processing for enhanced security and reliability
  - POST route consolidation for payment methods, wallet operations, and membership management
  - Comprehensive error handling with flash messaging for user feedback

- **Database Operations**:
  - Direct SQL query patterns with transparent database interactions
  - Removed helper function abstraction layers for cleaner, more maintainable code
  - Optimized transaction handling for wallet operations and membership subscriptions
  - Enhanced error handling with proper database rollback mechanisms

- **Performance Improvements**:
  - Minimal client-side JavaScript reducing page load times and complexity
  - Server-side processing ensuring consistent behavior across all browsers
  - Form-based submissions reducing network overhead compared to AJAX operations
  - Simplified codebase with direct database queries for better debugging and maintenance

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

**Note**: This application represents a comprehensive fitness gym management system built for educational purposes as part of the C237 Software Application Development course. The system demonstrates modern web development practices including server-side form processing, direct database operations, minimal JavaScript usage, accessibility compliance, and user-centered design principles. The latest version emphasizes server-side processing and traditional form-based interactions for optimal compatibility and maintainability.

## 📊 Recent Updates

### Version 2.2 JavaScript Elimination & Form Optimization (Current):
- ✅ **JavaScript to SQL Conversion**: Successfully converted billing system from 300+ lines of JavaScript to server-side forms
- ✅ **Form-Based Architecture**: Replaced all AJAX operations with traditional HTML form submissions for better compatibility
- ✅ **Direct Database Queries**: Removed helper function abstractions, implementing direct SQL operations for transparency
- ✅ **Enhanced Billing Operations**: Complete payment method management, wallet transactions, and membership plans via forms
- ✅ **Server-Side Processing**: All business logic moved to server-side with comprehensive validation and error handling
- ✅ **Code Simplification**: 90% reduction in client-side JavaScript while maintaining full functionality
- ✅ **Accessibility Improvements**: Form-based interactions provide better screen reader support and keyboard navigation
- ✅ **Performance Optimization**: Reduced client-side complexity and improved server-side processing efficiency

### Version 2.1 Code Architecture Foundation:
- ✅ **Database Integration**: MySQL connection with optimized query patterns and transaction handling
- ✅ **Authentication System**: Secure session management with comprehensive user validation
- ✅ **Profile Management**: File upload system with image validation and secure storage
- ✅ **Admin Features**: Enhanced member management with proper deletion workflows
- ✅ **UI/UX Consistency**: Bootstrap-based responsive design with improved visual hierarchy
- ✅ **Error Handling**: Flash messaging system with comprehensive user feedback

### Technical Achievements:
- **Code Quality**: Implemented server-side processing principles with direct SQL operations and form-based interactions
- **Performance**: Optimized client-side performance with minimal JavaScript usage and efficient server-side processing
- **Security**: Enhanced form validation, secure session handling, and direct database query patterns
- **Maintainability**: Simplified codebase with transparent database operations and consolidated form handling
- **User Experience**: Streamlined form-based workflows with intuitive interfaces and comprehensive server-side feedback
- **Accessibility**: Improved screen reader compatibility and keyboard navigation through traditional form elements