const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const flash = require("connect-flash");
const multer = require("multer");
require('dotenv').config();

const app = express();

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images"); // Directory to save uploaded files
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
    const { first_name, last_name, email, password, address, contact, dob, role, gender } = req.body;

    if (!first_name || !last_name || !email || !password || !address || !contact || !dob || !role || !gender) {
        return res.status(400).send("All fields are required.");
    }

    if (password.length < 8) {
        req.flash("error", "Password should be at least 8 characters")
        req.flash("formData", req.body);
        return res.redirect("/register");
    }
    next();
};

// Routes
app.get("/", (req, res) => {
    res.render("index", {user: req.session.user} );
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {console.log(`Server running on http://localhost:${PORT}`)});