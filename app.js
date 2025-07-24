const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const flash = require("connect-flash");
const multer = require("multer");
require('dotenv').config();

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/profile-pictures");
    },
    filename: (req, file, cb) => {
        // Generate unique filename for profile pictures
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.originalname.split('.').pop();
        cb(null, `profile-${uniqueSuffix}.${extension}`);
    }
});

// Add file filter for images only
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

// View engine and middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7} // 1 Week
}));

app.use(flash());

// Middleware: Check if user logged in
const checkAuthenticated = (req, res , next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash("error", "Please log in to view this resource");
        res.redirect("/login");
    }
};

// Middleware: Check if admin
const checkAdmin = (req, res, next) => {
    if (req.session.user.role === 'admin') {
        return next();
    } else {
        req.flash("error", "You do not have permission to view this resource.");
        res.redirect('/');
    }
};

// Middleware: Form validation
const validateRegistration = (req, res, next) => {
    const { username, email, gender, dob, contact, address, password, role } = req.body;

    if (!username || !email || !gender || !dob || !contact || !address || !password || !role) {
        req.flash("error", "All fields are required.");
        req.flash("formData", req.body);
        return res.redirect("/register");
    }

    if (password.length < 8) {
        req.flash("error", "Password should be at least 8 characters")
        req.flash("formData", req.body);
        return res.redirect("/register");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        req.flash("error", "Please enter a valid email address")
        req.flash("formData", req.body);
        return res.redirect("/register")
    }

    next();
};

// Routes
app.get("/", (req, res) => {
    // Default render data
    const renderData = {
        title: "KineGit | Home",
        user: req.session.user,
        messages: req.flash("success"),
        locations: [],
        upcomingClasses: [],
        stats: {
            totalLocations: 0,
            totalClasses: 0,
            totalMembers: 0
        }
    };

    // Check if database connection exists
    if (!db || db.state === 'disconnected') {
        console.error("Database connection not available");
        return res.render("index", renderData);
    }

    // Get locations for display
    const sqlLocations = "SELECT * FROM locations ORDER BY name LIMIT 3";
    db.query(sqlLocations, (err, locations) => {
        if (err) {
            console.error("Database error (locations): ", err);
        } else {
            renderData.locations = locations || [];
        }

        // Get upcoming classes for preview
        const sqlUpcomingClasses = `
            SELECT c.*, l.name as location_name, r.room_name,
                   (c.max_participants - COALESCE(booking_count.count, 0)) as available_spots
            FROM classes c
            JOIN locations l ON c.location_id = l.location_id
            JOIN rooms r ON c.room_id = r.room_id
            LEFT JOIN (
                SELECT class_id, COUNT(*) as count 
                FROM bookings 
                WHERE status = 'Booked' 
                GROUP BY class_id
            ) booking_count ON c.class_id = booking_count.class_id
            WHERE c.class_start_time > NOW()
            ORDER BY c.class_start_time ASC
            LIMIT 3
        `;
        
        db.query(sqlUpcomingClasses, (err, upcomingClasses) => {
            if (err) {
                console.error("Database error (upcoming classes): ", err);
            } else {
                renderData.upcomingClasses = upcomingClasses || [];
            }

            // Get basic stats
            const sqlStats = `
                SELECT 
                    (SELECT COUNT(*) FROM locations) as totalLocations,
                    (SELECT COUNT(*) FROM classes WHERE class_start_time > NOW()) as totalClasses,
                    (SELECT COUNT(*) FROM members WHERE role = 'user') as totalMembers
            `;
            
            db.query(sqlStats, (err, stats) => {
                if (err) {
                    console.error("Database error (stats): ", err);
                } else if (stats && stats[0]) {
                    renderData.stats = stats[0];
                }

                res.render("index", renderData);
            });
        });
    });
});

// Public pages (accessible without login)
app.get("/locations", (req, res) => {
    const sql = "SELECT * FROM locations ORDER BY name";
    
    db.query(sql, (err, locations) => {
        if (err) {
            console.error("Database error: ", err);
        }
        
        res.render("locations", {
            title: "KineGit | Locations",
            user: req.session.user || null,
            messages: req.flash("success"),
            locations: locations
        });
    });
});

app.get("/rooms", (req, res) => {
    const locationFilter = req.query.location;
    
    // Default render data
    const renderData = {
        title: "KineGit | Rooms",
        user: req.session.user || null,
        messages: req.flash("success"),
        rooms: [],
        locations: [],
        selectedLocation: locationFilter || null
    };

    // Check if database connection exists
    if (!db || db.state === 'disconnected') {
        console.error("Database connection not available");
        return res.render("rooms", renderData);
    }

    let sql = `
        SELECT r.*, l.name as location_name, l.address as location_address 
        FROM rooms r 
        JOIN locations l ON r.location_id = l.location_id 
    `;
    let queryParams = [];

    if (locationFilter) {
        sql += " WHERE LOWER(REPLACE(l.name, ' ', '-')) = ?";
        queryParams.push(locationFilter.toLowerCase());
    }

    sql += " ORDER BY l.name, r.room_name";

    db.query(sql, queryParams, (err, rooms) => {
        if (err) {
            console.error("Database error (rooms): ", err);
        } else {
            renderData.rooms = rooms || [];
        }

        // Get all locations for the filter dropdown
        const sqlLocations = "SELECT * FROM locations ORDER BY name";
        db.query(sqlLocations, (err, locations) => {
            if (err) {
                console.error("Database error (locations): ", err);
            } else {
                renderData.locations = locations || [];
            }

            res.render("rooms", renderData);
        });
    });
});

app.get("/classes", (req, res) => {
    const roomFilter = req.query.room;
    const locationFilter = req.query.location;
    
    // Default render data
    const renderData = {
        title: "KineGit | Classes",
        user: req.session.user || null,
        messages: req.flash("success"),
        classes: [],
        rooms: [],
        locations: [],
        selectedRoom: roomFilter || null,
        selectedLocation: locationFilter || null
    };

    // Check if database connection exists
    if (!db || db.state === 'disconnected') {
        console.error("Database connection not available");
        return res.render("classes", renderData);
    }

    let sql = `
        SELECT c.*, l.name as location_name, l.address as location_address, r.room_name,
               (c.max_participants - COALESCE(booking_count.count, 0)) as available_spots
        FROM classes c
        JOIN locations l ON c.location_id = l.location_id
        JOIN rooms r ON c.room_id = r.room_id
        LEFT JOIN (
            SELECT class_id, COUNT(*) as count 
            FROM bookings 
            WHERE status = 'Booked' 
            GROUP BY class_id
        ) booking_count ON c.class_id = booking_count.class_id
        WHERE 1=1
    `;
    let queryParams = [];

    if (roomFilter) {
        sql += " AND LOWER(r.room_name) = ?";
        queryParams.push(roomFilter.toLowerCase());
    }

    if (locationFilter) {
        sql += " AND LOWER(REPLACE(l.name, ' ', '-')) = ?";
        queryParams.push(locationFilter.toLowerCase());
    }

    sql += " ORDER BY c.class_start_time ASC";

    db.query(sql, queryParams, (err, classes) => {
        if (err) {
            console.error("Database error (classes): ", err);
        } else {
            renderData.classes = classes || [];
        }

        // Get all rooms for the filter dropdown
        const sqlRooms = "SELECT r.*, l.name as location_name FROM rooms r JOIN locations l ON r.location_id = l.location_id ORDER BY l.name, r.room_name";
        db.query(sqlRooms, (err, rooms) => {
            if (err) {
                console.error("Database error (rooms): ", err);
            } else {
                renderData.rooms = rooms || [];
            }

            // Get all locations for the filter dropdown
            const sqlLocations = "SELECT * FROM locations ORDER BY name";
            db.query(sqlLocations, (err, locations) => {
                if (err) {
                    console.error("Database error (locations): ", err);
                } else {
                    renderData.locations = locations || [];
                }

                res.render("classes", renderData);
            });
        });
    });
});

// Protected pages (require login)
app.get("/bookings", checkAuthenticated, (req, res) => {
    const userId = req.session.user.member_id || req.session.user.id;
    
    // Default render data
    const renderData = {
        title: "KineGit | My Bookings",
        user: req.session.user,
        messages: req.flash("success"),
        errors: req.flash("error"),
        bookings: [],
        upcomingClasses: []
    };

    // Check if database connection exists
    if (!db || db.state === 'disconnected') {
        console.error("Database connection not available");
        return res.render("afterloginejs/bookings", renderData);
    }

    // Get user's bookings with class details
    const sqlBookings = `
        SELECT b.*, c.class_name, c.class_type, c.instructor_name, 
               c.class_start_time, c.class_end_time, c.max_participants,
               l.name as location_name, l.address as location_address,
               r.room_name,
               (c.max_participants - COALESCE(booking_count.count, 0)) as available_spots
        FROM bookings b
        JOIN classes c ON b.class_id = c.class_id
        JOIN locations l ON c.location_id = l.location_id
        JOIN rooms r ON c.room_id = r.room_id
        LEFT JOIN (
            SELECT class_id, COUNT(*) as count 
            FROM bookings 
            WHERE status = 'Booked' 
            GROUP BY class_id
        ) booking_count ON c.class_id = booking_count.class_id
        WHERE b.member_id = ?
        ORDER BY c.class_start_time DESC
    `;

    db.query(sqlBookings, [userId], (err, bookings) => {
        if (err) {
            console.error("Database error (bookings): ", err);
        } else {
            renderData.bookings = bookings || [];
        }

        // Get available classes for booking
        const sqlUpcomingClasses = `
            SELECT c.*, l.name as location_name, r.room_name,
                   (c.max_participants - COALESCE(booking_count.count, 0)) as available_spots,
                   CASE WHEN user_bookings.booking_id IS NOT NULL THEN 1 ELSE 0 END as user_booked
            FROM classes c
            JOIN locations l ON c.location_id = l.location_id
            JOIN rooms r ON c.room_id = r.room_id
            LEFT JOIN (
                SELECT class_id, COUNT(*) as count 
                FROM bookings 
                WHERE status = 'Booked' 
                GROUP BY class_id
            ) booking_count ON c.class_id = booking_count.class_id
            LEFT JOIN (
                SELECT class_id, booking_id
                FROM bookings 
                WHERE member_id = ? AND status = 'Booked'
            ) user_bookings ON c.class_id = user_bookings.class_id
            WHERE c.class_start_time > NOW()
            ORDER BY c.class_start_time ASC
        `;

        db.query(sqlUpcomingClasses, [userId], (err, upcomingClasses) => {
            if (err) {
                console.error("Database error (upcoming classes): ", err);
            } else {
                renderData.upcomingClasses = upcomingClasses || [];
            }

            res.render("afterloginejs/bookings", renderData);
        });
    });
});

// Book a class
app.post("/book-class", checkAuthenticated, (req, res) => {
    const { classId } = req.body;
    const userId = req.session.user.member_id || req.session.user.id;

    if (!classId) {
        req.flash("error", "Class ID is required");
        return res.redirect("/bookings");
    }

    // Check if database connection exists
    if (!db || db.state === 'disconnected') {
        req.flash("error", "Database connection not available");
        return res.redirect("/bookings");
    }

    // Check if user already booked this class
    const checkBookingSQL = "SELECT * FROM bookings WHERE member_id = ? AND class_id = ? AND status = 'Booked'";
    db.query(checkBookingSQL, [userId, classId], (err, existingBookings) => {
        if (err) {
            console.error("Database error checking existing booking: ", err);
            req.flash("error", "Error checking existing bookings");
            return res.redirect("/bookings");
        }

        if (existingBookings.length > 0) {
            req.flash("error", "You have already booked this class");
            return res.redirect("/bookings");
        }

        // Check class availability
        const checkAvailabilitySQL = `
            SELECT c.*, 
                   (c.max_participants - COALESCE(booking_count.count, 0)) as available_spots
            FROM classes c
            LEFT JOIN (
                SELECT class_id, COUNT(*) as count 
                FROM bookings 
                WHERE status = 'Booked' 
                GROUP BY class_id
            ) booking_count ON c.class_id = booking_count.class_id
            WHERE c.class_id = ? AND c.class_start_time > NOW()
        `;

        db.query(checkAvailabilitySQL, [classId], (err, classInfo) => {
            if (err) {
                console.error("Database error checking availability: ", err);
                req.flash("error", "Error checking class availability");
                return res.redirect("/bookings");
            }

            if (classInfo.length === 0) {
                req.flash("error", "Class not found or has already started");
                return res.redirect("/bookings");
            }

            if (classInfo[0].available_spots <= 0) {
                req.flash("error", "This class is fully booked");
                return res.redirect("/bookings");
            }

            // Create the booking
            const bookingSQL = "INSERT INTO bookings (member_id, class_id, booking_date, status) VALUES (?, ?, CURDATE(), 'Booked')";
            db.query(bookingSQL, [userId, classId], (err, result) => {
                if (err) {
                    console.error("Database error creating booking: ", err);
                    req.flash("error", "Error creating booking");
                    return res.redirect("/bookings");
                }

                req.flash("success", `Successfully booked ${classInfo[0].class_name}!`);
                res.redirect("/bookings");
            });
        });
    });
});

// Cancel a booking
app.post("/cancel-booking", checkAuthenticated, (req, res) => {
    const { bookingId } = req.body;
    const userId = req.session.user.member_id || req.session.user.id;

    if (!bookingId) {
        req.flash("error", "Booking ID is required");
        return res.redirect("/bookings");
    }

    // Check if database connection exists
    if (!db || db.state === 'disconnected') {
        req.flash("error", "Database connection not available");
        return res.redirect("/bookings");
    }

    // Check if booking belongs to user and can be cancelled
    const checkBookingSQL = `
        SELECT b.*, c.class_start_time, c.class_name
        FROM bookings b
        JOIN classes c ON b.class_id = c.class_id
        WHERE b.booking_id = ? AND b.member_id = ? AND b.status = 'Booked'
    `;

    db.query(checkBookingSQL, [bookingId, userId], (err, bookings) => {
        if (err) {
            console.error("Database error checking booking: ", err);
            req.flash("error", "Error checking booking details");
            return res.redirect("/bookings");
        }

        if (bookings.length === 0) {
            req.flash("error", "Booking not found or already cancelled");
            return res.redirect("/bookings");
        }

        const booking = bookings[0];
        const classStartTime = new Date(booking.class_start_time);
        const now = new Date();
        const timeDiff = classStartTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);

        // Check if class starts within 2 hours (cancellation policy)
        if (hoursDiff < 2) {
            req.flash("error", "Cannot cancel booking less than 2 hours before class starts");
            return res.redirect("/bookings");
        }

        // Update booking status to cancelled
        const cancelSQL = "UPDATE bookings SET status = 'Cancelled' WHERE booking_id = ? AND member_id = ?";
        db.query(cancelSQL, [bookingId, userId], (err, result) => {
            if (err) {
                console.error("Database error cancelling booking: ", err);
                req.flash("error", "Error cancelling booking");
                return res.redirect("/bookings");
            }

            req.flash("success", `Successfully cancelled booking for ${booking.class_name}`);
            res.redirect("/bookings");
        });
    });
});

app.get("/billings", checkAuthenticated, (req, res) => {
    res.render("afterloginejs/billings", {
        title: "KineGit | Billing & Payments",
        user: req.session.user,
        messages: req.flash("success")
    });
});

// User Dashboard route (require login)
app.get("/userDashboard", checkAuthenticated, (req, res) => {
    // Get user's recent bookings
    const sqlBookings = `
        SELECT b.*, c.class_name, c.class_type, c.instructor_name, 
               c.class_start_time, c.class_end_time, l.name as location_name, r.room_name
        FROM bookings b
        JOIN classes c ON b.class_id = c.class_id
        JOIN locations l ON c.location_id = l.location_id
        JOIN rooms r ON c.room_id = r.room_id
        WHERE b.member_id = ?
        ORDER BY b.booking_date DESC
        LIMIT 5
    `;
    
    // Get user's billing information
    const sqlBillings = `
        SELECT * FROM billings 
        WHERE member_id = ?
        ORDER BY billing_date DESC
        LIMIT 3
    `;
    
    // Get upcoming classes for quick booking
    const sqlUpcomingClasses = `
        SELECT c.*, l.name as location_name, r.room_name,
               (c.max_participants - COALESCE(booking_count.count, 0)) as available_spots
        FROM classes c
        JOIN locations l ON c.location_id = l.location_id
        JOIN rooms r ON c.room_id = r.room_id
        LEFT JOIN (
            SELECT class_id, COUNT(*) as count 
            FROM bookings 
            WHERE status = 'Booked' 
            GROUP BY class_id
        ) booking_count ON c.class_id = booking_count.class_id
        WHERE c.class_start_time > NOW()
        ORDER BY c.class_start_time ASC
        LIMIT 6
    `;
    
    // Execute all queries
    db.query(sqlBookings, [req.session.user.member_id || req.session.user.id], (err, bookings) => {
        if (err) {
            console.error("Database error (bookings): ", err);
            bookings = [];
        }
        
        db.query(sqlBillings, [req.session.user.member_id || req.session.user.id], (err, billings) => {
            if (err) {
                console.error("Database error (billings): ", err);
                billings = [];
            }
            
            db.query(sqlUpcomingClasses, [], (err, upcomingClasses) => {
                if (err) {
                    console.error("Database error (upcoming classes): ", err);
                    upcomingClasses = [];
                }
                
                res.render("afterloginejs/userDashboard", {
                    title: "KineGit | My Dashboard",
                    user: req.session.user,
                    messages: req.flash("success"),
                    bookings: bookings,
                    billings: billings,
                    upcomingClasses: upcomingClasses
                });
            });
        });
    });
});

// Admin routes (require login and admin role)
app.get("/dashboard", checkAuthenticated, checkAdmin, (req, res) => {
    res.render("admin/dashboard", {
        title: "KineGit | Admin Dashboard",
        user: req.session.user,
        messages: req.flash("success")
    });
});

// Edit Profile routes (require login)
app.get("/editProfile", checkAuthenticated, (req, res) => {
    res.render("afterloginejs/editProfile", {
        title: "KineGit | Edit Profile",
        user: req.session.user,
        messages: req.flash("success"),
        errors: req.flash("error"),
        formData: req.flash("formData")[0] || req.session.user
    });
});

app.post("/editProfile", (req, res, next) => {
    upload.single('profilePicture')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            req.flash("error", "File upload error: " + err.message);
            return res.redirect("/editProfile");
        } else if (err) {
            req.flash("error", err.message);
            return res.redirect("/editProfile");
        }
        next();
    });
}, checkAuthenticated, (req, res) => {
    const { username, email, address, contact, dob, gender } = req.body;
    const userId = req.session.user.id;
    
    // Handle profile picture upload
    let profilePicture = req.session.user.profile_picture || 'defaultProfilePicture.jpg';
    if (req.file) {
        profilePicture = req.file.filename;
    }

    // Validation
    if (!username || !email || !address || !contact || !dob || !gender) {
        req.flash("error", "All fields are required.");
        req.flash("formData", req.body);
        return res.redirect("/editProfile");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        req.flash("error", "Please enter a valid email address.");
        req.flash("formData", req.body);
        return res.redirect("/editProfile");
    }

    // Check if email is already taken by another user
    const sqlCheckEmail = "SELECT * FROM members WHERE email = ? AND id != ?";
    db.query(sqlCheckEmail, [email, userId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Update failed. Please try again.");
            return res.redirect("/editProfile");
        }

        if (results.length > 0) {
            req.flash("error", "Email is already in use by another account.");
            req.flash("formData", req.body);
            return res.redirect("/editProfile");
        }

        // Update user profile including profile picture
        const sqlUpdate = "UPDATE members SET username = ?, email = ?, address = ?, contact = ?, dob = ?, gender = ?, profile_picture = ? WHERE id = ?";
        db.query(sqlUpdate, [username, email, address, contact, dob, gender, profilePicture, userId], (err, result) => {
            if (err) {
                console.error("Database error: ", err);
                req.flash("error", "Update failed. Please try again.");
                return res.redirect("/editProfile");
            }

            // Update session with new user data
            req.session.user.username = username;
            req.session.user.email = email;
            req.session.user.address = address;
            req.session.user.contact = contact;
            req.session.user.dob = dob;
            req.session.user.gender = gender;
            req.session.user.profile_picture = profilePicture;

            req.flash("success", "Profile updated successfully!");
            res.redirect("/editProfile");
        });
    });
});

// Logout route
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            req.flash("error", "Logout failed. Please try again.");
            return res.redirect("/");
        }
        res.redirect("/");
    });
});

app.get("/register", (req, res) => {
    res.render("auth/register", {
        title: "KineGit | Registration",
        user: req.session.user || null,
        formData: req.flash("formData")[0] || {},
        messages: req.flash("error")
    });
});

app.post("/register", validateRegistration, (req, res) => {
    const { username, email, gender, dob, contact, address, password, role } = req.body;
    const sqlCheckUser = "SELECT * FROM members WHERE username = ? OR email = ?";
    const sqlInsertUser = "INSERT INTO members (username, email, password, contact, dob, role, gender, address, profile_picture) VALUES (?, ?, SHA1(?), ?, ?, ?, ?, ?, ?)";

    db.query(sqlCheckUser, [username, email], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Registration failed. Please try again.");
            return res.redirect("/register");
        }

        if (results.length > 0) {
            req.flash("error", "Username or email is already in use.");
            req.flash("formData", req.body);
            return res.redirect("/register");
        }

        // Only insert if no existing user found - include default profile picture
        db.query(sqlInsertUser, [username, email, password, contact, dob, role, gender, address, "defaultProfilePicture.jpg"], (err, result) => {
            if (err) {
                console.error("Database error: ", err);
                req.flash("error", "Registration failed. Please try again.");
                return res.redirect("/register");
            }
            req.flash("success", "Registration successful! Please log in.");
            res.redirect("/login");
        });
    });
});

app.get("/login", (req, res) => {
    res.render("auth/login", {
        title: "KineGit | Login",
        user: req.session.user,
        errors: req.flash("error"),
        messages: req.flash("success")
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM members where email = ? AND password = SHA1(?)";

    if (!email || !password) {
        req.flash("error", "Login failed. All fields are required.");
        return res.redirect("/login");
    }

    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Login failed. Please try again.");
            return res.redirect("/login");
        }

        if (results.length > 0) {
            req.session.user = results[0];
            req.flash("success", "Login successful!");
            return res.redirect("/");
        } else {
            req.flash("error", "Invalid email or password.");
            return res.redirect("/login");
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {console.log(`Server running on http://localhost:${PORT}`)});