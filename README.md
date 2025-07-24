# Fitness Gym Management System

A comprehensive web application for managing fitness gym operations including member registration, class bookings, billing, profile management, and administrative functions. Built with modern web technologies and featuring a responsive, accessible design.

## ✨ Features

### 👤 Member Features
- **User Registration & Authentication**: Secure member registration and login system with comprehensive form validation
- **Profile Management**: Complete profile editing with profile picture upload functionality and secure file handling
- **User Dashboard**: Personalized dashboard with uniform card layouts, statistics display, and centered quick actions
- **Location Browsing**: View available gym locations with detailed information and contact details
- **Room Information**: Browse available rooms and facilities with enhanced visual presentation
- **Class Listings**: View fitness classes with real-time occupancy progress bars and enrollment tracking
- **Booking Management**: Book and manage fitness class reservations with intuitive interface
- **Billing System**: View billing information and membership plans with perfectly aligned pricing cards

### 🔧 Admin Features
- **Admin Dashboard**: Comprehensive overview of gym operations with analytics and insights
- **Member Management**: Manage member accounts, profiles, and information
- **Class Administration**: Create and manage fitness classes with capacity monitoring
- **Location Management**: Manage gym locations and facilities
- **System Settings**: Configure application settings and preferences

### 🆕 Latest Enhancements
- **Profile Picture System**: Complete upload, display, and management with fallback handling
- **Responsive Dashboard Layout**: Fixed-height cards with centered content and improved visual hierarchy
- **Interactive Progress Bars**: Real-time class occupancy display with smooth animations
- **Accessibility Improvements**: Enhanced form labels, screen reader support, and keyboard navigation
- **Visual Consistency**: Uniform button alignment, consistent spacing, and modern card layouts
- **Enhanced User Experience**: Improved navigation, responsive design, and comprehensive user feedback

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js framework
- **Database**: MySQL with enhanced schema and migration support
- **View Engine**: EJS (Embedded JavaScript) with Bootstrap 5.3.3
- **Authentication**: Express Session with Flash messaging system
- **File Upload**: Multer with comprehensive image validation and security
- **Environment Management**: dotenv for secure configuration
- **Frontend**: Bootstrap 5.3.3, Bootstrap Icons, fully responsive design
- **Accessibility**: WCAG compliant forms with screen reader support
- **Security**: Input validation, file type checking, and secure file handling

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
- `GET /afterloginejs/userDashboard` - Personalized dashboard with fixed-height cards and statistics
- `GET /afterloginejs/editProfile` - Profile editing page with secure picture upload
- `POST /afterloginejs/editProfile` - Update profile and upload profile picture with validation
- `GET /afterloginejs/billings` - Enhanced billing page with aligned membership plan cards
- `GET /bookings` - View and manage user bookings with improved interface
- `GET /classes` - Interactive class listings with real-time progress bars

### Admin Routes (Requires Admin Access)
- `GET /admin/dashboard` - Comprehensive admin dashboard
- `GET /admin/members` - Member management interface
- `GET /admin/classes` - Class administration
- `GET /admin/locations` - Location management
- `GET /admin/settings` - System configuration

## 🎯 Features Implementation Status

### ✅ COMPLETED & ENHANCED:
- **Core Application Structure**: Express.js server with MVC architecture and robust error handling
- **User Authentication System**: Complete registration, login, logout with secure session management
- **Database Integration**: MySQL connection with enhanced schema and migration scripts
- **Profile Management**: Full-featured profile editing with secure picture upload and validation
- **Enhanced User Dashboard**: Fixed-height card layouts with centered content and improved visual hierarchy
- **Dynamic Locations**: Database-driven location rendering with comprehensive fallback support
- **Advanced File Upload System**: Multer-based secure upload with image validation and storage management
- **Responsive Design**: Bootstrap 5.3.3 integration with mobile-first approach and accessibility features
- **Interactive Class Display**: Real-time progress bars with smooth animations and occupancy tracking
- **Accessibility Compliance**: WCAG-compliant forms with proper labels and screen reader support
- **Visual Consistency**: Uniform button alignment, consistent spacing across all components
- **Modern UI Components**: Enhanced navigation with profile dropdown and intuitive user flows

### 🔧 TECHNICAL ENHANCEMENTS:
- **Profile Picture System**: 
  - Comprehensive upload system with Multer configuration
  - Advanced image validation (JPEG, PNG, GIF support)
  - File size limits and security checks with error handling
  - Automatic filename generation preventing conflicts
  - Graceful fallback to default images for missing pictures
  - Secure file path handling with proper URL resolution

- **Dashboard Improvements**:
  - Fixed-height card layouts (400px/300px) for visual consistency
  - Flexbox-centered Quick Actions with enhanced button sizing
  - Profile sidebar with dynamic picture display and user information
  - Statistics cards with improved data presentation
  - Responsive design maintaining consistency across devices

- **Form Accessibility**:
  - Visually-hidden labels for screen reader compatibility
  - Enhanced placeholder text for better user guidance
  - Proper ARIA attributes and keyboard navigation support
  - Input validation with user-friendly error messages

- **UI/UX Enhancements**:
  - Progress bars with data-attribute approach and JavaScript animation
  - Flexbox-aligned membership plan buttons using Bootstrap utilities
  - Consistent color schemes and typography across all pages
  - Smooth transitions and hover effects for better interaction feedback

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

### Version 2.0 Enhancements:
- ✅ **Profile Picture System**: Complete implementation with secure upload and fallback handling
- ✅ **Dashboard Redesign**: Fixed-height cards with centered content and improved visual hierarchy  
- ✅ **Interactive Progress Bars**: Real-time class occupancy display with smooth animations
- ✅ **Accessibility Improvements**: WCAG-compliant forms with enhanced screen reader support
- ✅ **Visual Consistency**: Uniform button alignment and consistent spacing across all components
- ✅ **Responsive Enhancements**: Mobile-first design with improved cross-device compatibility

### Technical Improvements:
- Enhanced database schema with profile picture support and migration scripts
- Improved file upload security with comprehensive validation and error handling
- Bootstrap 5.3.3 integration with modern utility classes and flexbox layouts
- Accessibility compliance with proper ARIA attributes and keyboard navigation
- Optimized performance with efficient file handling and responsive image loading