const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const flash = require("connect-flash");
const multer = require("multer");
require('dotenv').config();

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
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
    res.render("index", {
        title: "KineGit | Home",
        user: req.session.user,
        messages: req.flash("success")
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
    res.render("rooms", {
        title: "KineGit | Rooms",
        user: req.session.user || null,
        messages: req.flash("success")
    });
});

app.get("/classes", (req, res) => {
    res.render("classes", {
        title: "KineGit | Classes",
        user: req.session.user || null,
        messages: req.flash("success")
    });
});

// Protected pages (require login)
app.get("/bookings", checkAuthenticated, (req, res) => {
    res.render("bookings", {
        title: "KineGit | My Bookings",
        user: req.session.user,
        messages: req.flash("success")
    });
});

app.get("/billings", checkAuthenticated, (req, res) => {
    res.render("billings", {
        title: "KineGit | Billing & Payments",
        user: req.session.user,
        messages: req.flash("success")
    });
});

// User Dashboard route (require login)
app.get("/user-dashboard", checkAuthenticated, (req, res) => {
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
    db.query(sqlBookings, [req.session.user.id], (err, bookings) => {
        if (err) {
            console.error("Database error (bookings): ", err);
            bookings = [];
        }
        
        db.query(sqlBillings, [req.session.user.id], (err, billings) => {
            if (err) {
                console.error("Database error (billings): ", err);
                billings = [];
            }
            
            db.query(sqlUpcomingClasses, [], (err, upcomingClasses) => {
                if (err) {
                    console.error("Database error (upcoming classes): ", err);
                    upcomingClasses = [];
                }
                
                res.render("userDashboard", {
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
    res.render("editProfile", {
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
    let profilePicture = req.session.user.profile_picture || 'defaultProfilePicture.png';
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
        db.query(sqlInsertUser, [username, email, password, contact, dob, role, gender, address, "defaultProfilePicture.png"], (err, result) => {
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