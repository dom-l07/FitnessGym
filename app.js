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
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

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
    res.render("locations", {
        title: "KineGit | Locations",
        user: req.session.user || null,
        messages: req.flash("success")
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

// Admin routes (require login and admin role)
app.get("/dashboard", checkAuthenticated, checkAdmin, (req, res) => {
    res.render("admin/dashboard", {
        title: "KineGit | Admin Dashboard",
        user: req.session.user,
        messages: req.flash("success")
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
    const sqlInsertUser = "INSERT INTO members (username, email, password, contact, dob, role, gender, address) VALUES (?, ?, SHA1(?), ?, ?, ?, ?, ?)";

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

        // Only insert if no existing user found
        db.query(sqlInsertUser, [username, email, password, contact, dob, role, gender, address], (err, result) => {
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