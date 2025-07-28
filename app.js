const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const flash = require("connect-flash");
const multer = require("multer");

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = file.fieldname === 'locationImage' ? "public/uploads/location-images" : "public/uploads/profile-pictures";
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.originalname.split('.').pop();
        const prefix = file.fieldname === 'locationImage' ? 'location' : 'profile';
        cb(null, `${prefix}-${uniqueSuffix}.${extension}`);
    }
});

// Add file filter for images only
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
    limits: { fileSize: 5 * 1024 * 1024 }
});

const db = mysql.createConnection({
    host: "zl-0k6.h.filess.io",
    port: 3307,
    user: "kinegit_beforefact",
    password: "e21ff8d5584391be8da6a739de042848972db1b6",
    database: "kinegit_beforefact"
});

db.connect((err) => {
    if (err) console.error("Error connecting to MySQL:", err);
    else console.log("Connected to MySQL database");
});

// View engine and middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session Middleware
app.use(session({
    secret: "c237isamazingandfun",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

app.use(flash());

// Middleware: Check if user logged in
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    req.flash("error", "Please log in to view this resource");
    res.redirect("/login");
};

// Middleware: Check if admin
const checkAdmin = (req, res, next) => {
    if (req.session.user.role === 'admin') return next();
    req.flash("error", "You do not have permission to view this resource.");
    res.redirect('/');
};

// Middleware: Form validation
const validateRegistration = (req, res, next) => {
    const { username, email, gender, dob, contact, address, password, role } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username || !email || !gender || !dob || !contact || !address || !password || !role) {
        req.flash("error", "All fields are required.");
        req.flash("formData", req.body);
        return res.redirect("/register");
    }

    if (password.length < 8) {
        req.flash("error", "Password should be at least 8 characters");
        req.flash("formData", req.body);
        return res.redirect("/register");
    }

    if (!emailRegex.test(email)) {
        req.flash("error", "Please enter a valid email address");
        req.flash("formData", req.body);
        return res.redirect("/register");
    }

    next();
};

// Routes
app.get("/", (req, res) => {
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

    if (!db || db.state === 'disconnected') {
        console.error("Database connection not available");
        return res.render("index", renderData);
    }

    const sqlLocations = "SELECT * FROM locations ORDER BY name LIMIT 3";
    db.query(sqlLocations, (err, locations) => {
        if (err) {
            console.error("Database error (locations): ", err);
        } else {
            renderData.locations = locations || [];
        }

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
    db.query("SELECT * FROM locations ORDER BY name", (err, locations) => {
        if (err) console.error("Database error: ", err);
        res.render("locations", {
            title: "KineGit | Locations",
            user: req.session.user || null,
            messages: req.flash("success"),
            locations: locations || []
        });
    });
});

app.get("/rooms", (req, res) => {
    const locationFilter = req.query.location;
    
    const renderData = {
        title: "KineGit | Rooms",
        user: req.session.user || null,
        messages: req.flash("success"),
        rooms: [],
        locations: [],
        selectedLocation: locationFilter || null
    };

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

        const sqlRooms = "SELECT r.*, l.name as location_name FROM rooms r JOIN locations l ON r.location_id = l.location_id ORDER BY l.name, r.room_name";
        db.query(sqlRooms, (err, rooms) => {
            if (err) {
                console.error("Database error (rooms): ", err);
            } else {
                renderData.rooms = rooms || [];
            }

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
    
    const renderData = {
        title: "KineGit | My Bookings",
        user: req.session.user,
        messages: req.flash("success"),
        errors: req.flash("error"),
        bookings: [],
        upcomingClasses: []
    };

    if (!db || db.state === 'disconnected') {
        console.error("Database connection not available");
        return res.render("afterloginejs/bookings", renderData);
    }

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

    if (!db || db.state === 'disconnected') {
        req.flash("error", "Database connection not available");
        return res.redirect("/bookings");
    }

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

    if (!db || db.state === 'disconnected') {
        req.flash("error", "Database connection not available");
        return res.redirect("/bookings");
    }

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

        if (hoursDiff < 2) {
            req.flash("error", "Cannot cancel booking less than 2 hours before class starts");
            return res.redirect("/bookings");
        }

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
    const memberId = req.session.user.member_id || req.session.user.id;
    
    const createWalletSql = "INSERT IGNORE INTO wallet (member_id, balance) VALUES (?, 0.00)";
    db.query(createWalletSql, [memberId], (walletErr) => {
        if (walletErr) {
            console.error("Error creating wallet entry:", walletErr);
        }
        
        const sqlPaymentMethods = `
            SELECT * FROM payment_methods 
            WHERE member_id = ?
            ORDER BY is_default DESC, created_at DESC
        `;
        
        const sqlWallet = `
            SELECT * FROM wallet 
            WHERE member_id = ?
        `;
        
        const sqlTransactions = `
            SELECT wt.*, pm.method_type, pm.card_number_last4
            FROM wallet_transactions wt
            LEFT JOIN payment_methods pm ON wt.payment_method_id = pm.payment_method_id
            WHERE wt.member_id = ?
            ORDER BY wt.transaction_date DESC
            LIMIT 20
        `;
        
        const sqlCurrentSubscription = `
            SELECT ms.*, mp.plan_name, mp.price, mp.features 
            FROM membership_subscriptions ms
            JOIN membership_plans mp ON ms.plan_id = mp.plan_id
            WHERE ms.member_id = ? AND ms.status = 'Active'
            ORDER BY ms.start_date DESC
            LIMIT 1
        `;
        
        const sqlMembershipPlans = `
            SELECT * FROM membership_plans ORDER BY price ASC
        `;
        
        db.query(sqlPaymentMethods, [memberId], (err, paymentMethods) => {
            if (err) {
                console.error("Database error (payment methods): ", err);
                paymentMethods = [];
            }
            
            db.query(sqlWallet, [memberId], (err, walletResults) => {
                if (err) {
                    console.error("Database error (wallet): ", err);
                }
                
                const wallet = walletResults && walletResults.length > 0 ? walletResults[0] : { balance: 0 };
                
                db.query(sqlTransactions, [memberId], (err, transactions) => {
                    if (err) {
                        console.error("Database error (transactions): ", err);
                        transactions = [];
                    }
                    
                    db.query(sqlCurrentSubscription, [memberId], (err, currentSubscription) => {
                        if (err) {
                            console.error("Database error (current subscription): ", err);
                            currentSubscription = [];
                        }
                        
                        db.query(sqlMembershipPlans, [], (err, membershipPlans) => {
                            if (err) {
                                console.error("Database error (membership plans): ", err);
                                membershipPlans = [];
                            }
                            
                            res.render("afterloginejs/billings", {
                                title: "KineGit | Billing & Payments",
                                user: req.session.user,
                                messages: req.flash("success"),
                                errors: req.flash("error"),
                                paymentMethods: paymentMethods,
                                wallet: wallet,
                                transactions: transactions,
                                currentSubscription: currentSubscription[0] || null,
                                membershipPlans: membershipPlans
                            });
                        });
                    });
                });
            });
        });
    });
});

// Add payment method
app.post("/billing/payment-methods", checkAuthenticated, (req, res) => {
    const memberId = req.session.user.member_id || req.session.user.id;
    const { methodType, cardNumber, expiryDate, cvv, cardholderName, paypalEmail, accountNumber, bankName, setAsDefault } = req.body;
    
    const cardNumberLast4 = cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : null;
    
    if (setAsDefault) {
        db.query("UPDATE payment_methods SET is_default = 0 WHERE member_id = ?", [memberId]);
    }
    
    const values = [
        memberId, methodType, cardNumberLast4, cardholderName || null, 
        expiryDate || null, paypalEmail || null, accountNumber || null, 
        bankName || null, setAsDefault ? 1 : 0
    ];
    
    const sql = `INSERT INTO payment_methods (member_id, method_type, card_number_last4, cardholder_name, 
                 expiry_date, paypal_email, account_number, bank_name, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error("Database error adding payment method:", err);
            return res.json({ success: false, message: "Failed to add payment method: " + err.message });
        }
        res.json({ success: true, message: "Payment method added successfully" });
    });
});

// Set default payment method
app.put("/billing/payment-methods/:id/set-default", checkAuthenticated, (req, res) => {
    const memberId = req.session.user.member_id || req.session.user.id;
    const paymentMethodId = req.params.id;
    
    db.query("UPDATE payment_methods SET is_default = 0 WHERE member_id = ?", [memberId], (err) => {
        if (err) return res.json({ success: false, message: "Failed to update default payment method" });
        
        db.query("UPDATE payment_methods SET is_default = 1 WHERE payment_method_id = ? AND member_id = ?", 
            [paymentMethodId, memberId], (err, results) => {
            if (err) return res.json({ success: false, message: "Failed to update default payment method" });
            if (results.affectedRows === 0) return res.json({ success: false, message: "Payment method not found" });
            res.json({ success: true, message: "Default payment method updated" });
        });
    });
});

// Delete payment method
app.delete("/billing/payment-methods/:id", checkAuthenticated, (req, res) => {
    const memberId = req.session.user.member_id || req.session.user.id;
    
    db.query("DELETE FROM payment_methods WHERE payment_method_id = ? AND member_id = ?", 
        [req.params.id, memberId], (err, results) => {
        if (err) return res.json({ success: false, message: "Failed to delete payment method" });
        if (results.affectedRows === 0) return res.json({ success: false, message: "Payment method not found" });
        res.json({ success: true, message: "Payment method deleted successfully" });
    });
});

// Add funds to wallet
app.post("/billing/add-funds", checkAuthenticated, (req, res) => {
    const memberId = req.session.user.member_id || req.session.user.id;
    const { amount, paymentMethodId } = req.body;
    const fundAmount = parseFloat(amount);
    const sqlCheckWallet = "SELECT * FROM wallet WHERE member_id = ?";
    const sqlCreateWallet = "INSERT INTO wallet (member_id, balance) VALUES (?, ?)";
    const sqlUpdateWallet = "UPDATE wallet SET balance = balance + ? WHERE member_id = ?";
    
    if (!fundAmount || fundAmount <= 0) {
        return res.json({ success: false, message: "Invalid amount" });
    }
    
    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction start error:", err);
            return res.json({ success: false, message: "Transaction failed" });
        }
        
        db.query(sqlCheckWallet, [memberId], (err, walletResults) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Error checking wallet:", err);
                    res.json({ success: false, message: "Transaction failed" });
                });
            }
            
            if (walletResults.length === 0) {
                db.query(sqlCreateWallet, [memberId, fundAmount], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Error creating wallet:", err);
                            res.json({ success: false, message: "Transaction failed" });
                        });
                    }
                    
                    addTransaction();
                });
            } else {                
                db.query(sqlUpdateWallet, [fundAmount, memberId], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Error updating wallet:", err);
                            res.json({ success: false, message: "Transaction failed" });
                        });
                    }
                    
                    addTransaction();
                });
            }
        });
        
        function addTransaction() {
            const sqlAddTransaction = `
                INSERT INTO wallet_transactions (member_id, payment_method_id, transaction_type, amount, description, status)
                VALUES (?, ?, 'Add Funds', ?, 'Funds added to wallet', 'Completed')
            `;
            
            db.query(sqlAddTransaction, [memberId, paymentMethodId, fundAmount], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error adding transaction:", err);
                        res.json({ success: false, message: "Transaction failed" });
                    });
                }
                
                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Transaction commit error:", err);
                            res.json({ success: false, message: "Transaction failed" });
                        });
                    }
                    
                    res.json({ success: true, message: `$${fundAmount.toFixed(2)} added to your wallet successfully` });
                });
            });
        }
    });
});

// Select membership plan
app.post("/billing/select-plan", checkAuthenticated, (req, res) => {
    const memberId = req.session.user.member_id || req.session.user.id;
    const { planId } = req.body;
    const sqlCheckSubscription = "SELECT * FROM membership_subscriptions WHERE member_id = ? AND status = 'Active'";
    const sqlPlanDetails = "SELECT * FROM membership_plans WHERE plan_id = ?";
    const sqlWalletBalance = "SELECT balance FROM wallet WHERE member_id = ?";
    
    if (!planId) {
        return res.json({ success: false, message: "Plan ID is required" });
    }
    
    db.query(sqlCheckSubscription, [memberId], (err, activeSubscriptions) => {
        if (err) {
            console.error("Error checking active subscription:", err);
            return res.json({ success: false, message: "Failed to check subscription status" });
        }
        
        if (activeSubscriptions.length > 0) {
            return res.json({ success: false, message: "You already have an active membership plan. Please cancel your current plan first." });
        }
        
        db.query(sqlPlanDetails, [planId], (err, planResults) => {
            if (err) {
                console.error("Error fetching plan details:", err);
                return res.json({ success: false, message: "Failed to fetch plan details" });
            }
            
            if (planResults.length === 0) {
                return res.json({ success: false, message: "Plan not found" });
            }
            
            const plan = planResults[0];
            
            db.query(sqlWalletBalance, [memberId], (err, walletResults) => {
                if (err) {
                    console.error("Error fetching wallet balance:", err);
                    return res.json({ success: false, message: "Failed to check wallet balance" });
                }
                
                const currentBalance = walletResults.length > 0 ? walletResults[0].balance : 0;
                const planPrice = parseFloat(plan.price);
                
                if (currentBalance < planPrice) {
                    return res.json({ 
                        success: false, 
                        message: `Insufficient funds. You need $${planPrice.toFixed(2)} but only have $${parseFloat(currentBalance).toFixed(2)} in your wallet.` 
                    });
                }
                
                db.beginTransaction((err) => {
                    if (err) {
                        console.error("Transaction start error:", err);
                        return res.json({ success: false, message: "Transaction failed" });
                    }
                    
                    const sqlUpdateWallet = "UPDATE wallet SET balance = balance - ? WHERE member_id = ?";
                    
                    db.query(sqlUpdateWallet, [planPrice, memberId], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Error updating wallet:", err);
                                res.json({ success: false, message: "Payment failed" });
                            });
                        }
                        
                        const sqlCreateSubscription = "INSERT INTO membership_subscriptions (member_id, plan_id, status) VALUES (?, ?, 'Active')";
                        
                        db.query(sqlCreateSubscription, [memberId, planId], (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error("Error creating subscription:", err);
                                    res.json({ success: false, message: "Subscription creation failed" });
                                });
                            }
                            
                            const sqlAddTransaction = `
                                INSERT INTO wallet_transactions (member_id, transaction_type, amount, description, status)
                                VALUES (?, 'Payment', ?, ?, 'Completed')
                            `;
                            
                            const description = `${plan.plan_name} membership plan subscription`;
                            
                            db.query(sqlAddTransaction, [memberId, planPrice, description], (err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error("Error adding transaction:", err);
                                        res.json({ success: false, message: "Transaction record failed" });
                                    });
                                }
                                
                                db.commit((err) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            console.error("Transaction commit error:", err);
                                            res.json({ success: false, message: "Transaction commit failed" });
                                        });
                                    }
                                    
                                    res.json({ 
                                        success: true, 
                                        message: `Successfully subscribed to ${plan.plan_name} plan for $${planPrice.toFixed(2)}!` 
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// Cancel membership plan
app.post("/billing/cancel-plan", checkAuthenticated, (req, res) => {
    const memberId = req.session.user.member_id || req.session.user.id;
    
    const sqlCheckSubscription = `
        SELECT ms.*, mp.plan_name 
        FROM membership_subscriptions ms
        JOIN membership_plans mp ON ms.plan_id = mp.plan_id
        WHERE ms.member_id = ? AND ms.status = 'Active'
    `;
    
    db.query(sqlCheckSubscription, [memberId], (err, activeSubscriptions) => {
        if (err) {
            console.error("Error checking active subscription:", err);
            return res.json({ success: false, message: "Failed to check subscription status" });
        }
        
        if (activeSubscriptions.length === 0) {
            return res.json({ success: false, message: "No active subscription found" });
        }
        
        const subscription = activeSubscriptions[0];
        
        const sqlCancelSubscription = "UPDATE membership_subscriptions SET status = 'Cancelled' WHERE subscription_id = ? AND member_id = ?";
        
        db.query(sqlCancelSubscription, [subscription.subscription_id, memberId], (err, result) => {
            if (err) {
                console.error("Error cancelling subscription:", err);
                return res.json({ success: false, message: "Failed to cancel subscription" });
            }
            
            if (result.affectedRows === 0) {
                return res.json({ success: false, message: "Subscription not found" });
            }
            
            res.json({ 
                success: true, 
                message: `Successfully cancelled your ${subscription.plan_name} membership plan.` 
            });
        });
    });
});

// User Dashboard route (require login)
app.get("/userDashboard", checkAuthenticated, (req, res) => {
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
    
    const sqlBillings = `
        SELECT * FROM billings 
        WHERE member_id = ?
        ORDER BY billing_date DESC
        LIMIT 3
    `;
    
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
    `;
    
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
    const renderData = {
        title: "KineGit | Admin Dashboard",
        user: req.session.user,
        messages: req.flash("success"),
        stats: {
            totalMembers: 0,
            totalClasses: 0,
            totalLocations: 0,
            totalBookings: 0
        }
    };

    if (!db || db.state === 'disconnected') {
        console.error("Database connection not available");
        return res.render("admin/dashboard", renderData);
    }

    const sqlStats = `
        SELECT 
            (SELECT COUNT(*) FROM members) as totalMembers,
            (SELECT COUNT(*) FROM classes) as totalClasses,
            (SELECT COUNT(*) FROM locations) as totalLocations,
            (SELECT COUNT(*) FROM bookings) as totalBookings
    `;
    
    db.query(sqlStats, (err, stats) => {
        if (err) {
            console.error("Database error (stats): ", err);
        } else if (stats && stats[0]) {
            renderData.stats = stats[0];
        }

        res.render("admin/dashboard", renderData);
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

    let profilePicture = req.session.user.profile_picture || 'defaultProfilePicture.jpg';
    if (req.file) {
        profilePicture = req.file.filename;
    }

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

        const sqlUpdate = "UPDATE members SET username = ?, email = ?, address = ?, contact = ?, dob = ?, gender = ?, profile_picture = ? WHERE id = ?";
        db.query(sqlUpdate, [username, email, address, contact, dob, gender, profilePicture, userId], (err, result) => {
            if (err) {
                console.error("Database error: ", err);
                req.flash("error", "Update failed. Please try again.");
                return res.redirect("/editProfile");
            }

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

// Admin Member Management Routes
app.get("/admin/members", checkAuthenticated, checkAdmin, (req, res) => {
    db.query("SELECT * FROM members ORDER BY username ASC", (err, members) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Error fetching members data");
            members = [];
        }
        
        res.render("admin/panel/manageMembers", {
            title: "KineGit | Manage Members",
            user: req.session.user,
            members: members,
            messages: req.flash("success"),
            errors: req.flash("error")
        });
    });
});

// Get member details (AJAX)
app.get("/admin/members/:id/details", checkAuthenticated, checkAdmin, (req, res) => {
    db.query("SELECT * FROM members WHERE id = ?", [req.params.id], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            return res.json({ success: false, error: "Database error" });
        }
        
        if (results.length === 0) {
            return res.json({ success: false, error: "Member not found" });
        }
        
        res.json({ success: true, member: results[0] });
    });
});

// Update member
app.post("/admin/members/:id/update", (req, res, next) => {
    upload.single('profilePicture')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            req.flash("error", "File upload error: " + err.message);
            return res.redirect("/admin/members");
        } else if (err) {
            req.flash("error", err.message);
            return res.redirect("/admin/members");
        }
        next();
    });
}, checkAuthenticated, checkAdmin, (req, res) => {
    const memberId = req.params.id;
    const { username, email, contact, dob, role, gender, address, password } = req.body;

    if (!username || !email || !contact || !dob || !role || !gender || !address) {
        req.flash("error", "All fields except password and profile picture are required.");
        return res.redirect("/admin/members");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        req.flash("error", "Please enter a valid email address.");
        return res.redirect("/admin/members");
    }

    const sqlCheckEmail = "SELECT * FROM members WHERE email = ? AND id != ?";
    db.query(sqlCheckEmail, [email, memberId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Error checking email availability. Please try again.");
            return res.redirect("/admin/members");
        }

        if (results.length > 0) {
            req.flash("error", "Email is already in use by another member.");
            return res.redirect("/admin/members");
        }

        // Get current member data
        const sqlGetMember = "SELECT * FROM members WHERE id = ?";
        db.query(sqlGetMember, [memberId], (err, memberResults) => {
            if (err) {
                console.error("Database error: ", err);
                req.flash("error", "Error fetching member data.");
                return res.redirect("/admin/members");
            }

            if (memberResults.length === 0) {
                req.flash("error", "Member not found.");
                return res.redirect("/admin/members");
            }

            const currentMember = memberResults[0];
            
            // Handle profile picture upload
            let profilePicture = currentMember.profile_picture;
            if (req.file) {
                profilePicture = req.file.filename;
            }

            // Prepare update query
            let sqlUpdate, queryParams;
            
            if (password && password.trim() !== '') {
                // Update with new password
                if (password.length < 8) {
                    req.flash("error", "Password should be at least 8 characters");
                    return res.redirect("/admin/members");
                }
                sqlUpdate = "UPDATE members SET username = ?, email = ?, password = SHA1(?), contact = ?, dob = ?, role = ?, gender = ?, address = ?, profile_picture = ? WHERE id = ?";
                queryParams = [username, email, password, contact, dob, role, gender, address, profilePicture, memberId];
            } else {
                // Update without changing password
                sqlUpdate = "UPDATE members SET username = ?, email = ?, contact = ?, dob = ?, role = ?, gender = ?, address = ?, profile_picture = ? WHERE id = ?";
                queryParams = [username, email, contact, dob, role, gender, address, profilePicture, memberId];
            }

            db.query(sqlUpdate, queryParams, (err, result) => {
                if (err) {
                    console.error("Database error: ", err);
                    req.flash("error", "Error updating member. Please try again.");
                    return res.redirect("/admin/members");
                }

                req.flash("success", `Member "${username}" has been successfully updated!`);
                res.redirect("/admin/members");
            });
        });
    });
});

// Delete member
app.post("/admin/members/:id/delete", checkAuthenticated, checkAdmin, (req, res) => {
    const memberId = req.params.id;
    const currentUserId = req.session.user.id;

    if (memberId == currentUserId) {
        req.flash("error", "You cannot delete your own account.");
        return res.redirect("/admin/members");
    }

    const sqlGetMember = "SELECT username FROM members WHERE id = ?";
    db.query(sqlGetMember, [memberId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Error fetching member data.");
            return res.redirect("/admin/members");
        }

        if (results.length === 0) {
            req.flash("error", "Member not found.");
            return res.redirect("/admin/members");
        }

        const memberName = results[0].username;

        db.beginTransaction((err) => {
            if (err) {
                console.error("Transaction start error:", err);
                req.flash("error", "Error starting deletion process.");
                return res.redirect("/admin/members");
            }
            
            const sqlDeleteTransactions = "DELETE FROM wallet_transactions WHERE member_id = ?";
            db.query(sqlDeleteTransactions, [memberId], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error deleting wallet transactions:", err);
                        req.flash("error", "Error deleting member's transaction records.");
                        res.redirect("/admin/members");
                    });
                }

                const sqlDeletePaymentMethods = "DELETE FROM payment_methods WHERE member_id = ?";
                db.query(sqlDeletePaymentMethods, [memberId], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Error deleting payment methods:", err);
                            req.flash("error", "Error deleting member's payment methods.");
                            res.redirect("/admin/members");
                        });
                    }

                    const sqlDeleteSubscriptions = "DELETE FROM membership_subscriptions WHERE member_id = ?";
                    db.query(sqlDeleteSubscriptions, [memberId], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Error deleting subscriptions:", err);
                                req.flash("error", "Error deleting member's subscriptions.");
                                res.redirect("/admin/members");
                            });
                        }

                        const sqlDeleteWallet = "DELETE FROM wallet WHERE member_id = ?";
                        db.query(sqlDeleteWallet, [memberId], (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error("Error deleting wallet:", err);
                                    req.flash("error", "Error deleting member's wallet.");
                                    res.redirect("/admin/members");
                                });
                            }

                            const sqlDeleteBookings = "DELETE FROM bookings WHERE member_id = ?";
                            db.query(sqlDeleteBookings, [memberId], (err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error("Error deleting bookings:", err);
                                        req.flash("error", "Error deleting member's bookings.");
                                        res.redirect("/admin/members");
                                    });
                                }

                                const sqlDeleteBillings = "DELETE FROM billings WHERE member_id = ?";
                                db.query(sqlDeleteBillings, [memberId], (err) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            console.error("Error deleting billings:", err);
                                            req.flash("error", "Error deleting member's billing records.");
                                            res.redirect("/admin/members");
                                        });
                                    }

                                    const sqlDeleteMember = "DELETE FROM members WHERE id = ?";
                                    db.query(sqlDeleteMember, [memberId], (err, result) => {
                                        if (err) {
                                            return db.rollback(() => {
                                                console.error("Error deleting member:", err);
                                                req.flash("error", "Error deleting member. Please try again.");
                                                res.redirect("/admin/members");
                                            });
                                        }

                                        db.commit((err) => {
                                            if (err) {
                                                return db.rollback(() => {
                                                    console.error("Transaction commit error:", err);
                                                    req.flash("error", "Error completing deletion process.");
                                                    res.redirect("/admin/members");
                                                });
                                            }

                                            req.flash("success", `Member "${memberName}" and all related records have been successfully deleted.`);
                                            res.redirect("/admin/members");
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get("/admin/locations", checkAuthenticated, checkAdmin, (req, res) => {
    const renderData = {
        title: "KineGit | Manage Locations",
        user: req.session.user,
        messages: req.flash("success"),
        errors: req.flash("error"),
        locations: []
    };

    if (!db || db.state === 'disconnected') {
        console.error("Database connection not available");
        return res.render("admin/panel/manageLocations", renderData);
    }

    const sqlLocations = `
        SELECT l.*, 
               COUNT(DISTINCT r.room_id) as room_count,
               COUNT(DISTINCT c.class_id) as class_count
        FROM locations l
        LEFT JOIN rooms r ON l.location_id = r.location_id
        LEFT JOIN classes c ON l.location_id = c.location_id
        GROUP BY l.location_id
        ORDER BY l.name ASC
    `;
    
    db.query(sqlLocations, (err, locations) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Error fetching locations data");
        } else {
            renderData.locations = locations || [];
        }

        const sqlStats = `
            SELECT 
                (SELECT COUNT(*) FROM rooms) as totalRooms,
                (SELECT COUNT(*) FROM classes) as totalClasses
        `;
        
        db.query(sqlStats, (err, stats) => {
            if (err) {
                console.error("Database error (stats): ", err);
            } else if (stats && stats[0]) {
                renderData.stats = stats[0];
            }

            res.render("admin/panel/manageLocations", renderData);
        });
    });
});

// Get location details (AJAX)
app.get("/admin/locations/:id/details", checkAuthenticated, checkAdmin, (req, res) => {
    const locationId = req.params.id;
    
    const sqlLocation = "SELECT * FROM locations WHERE location_id = ?";
    const sqlRooms = "SELECT * FROM rooms WHERE location_id = ? ORDER BY room_name";
    const sqlClasses = `
        SELECT c.*, r.room_name 
        FROM classes c 
        JOIN rooms r ON c.room_id = r.room_id 
        WHERE c.location_id = ? 
        ORDER BY c.class_start_time ASC
    `;
    
    db.query(sqlLocation, [locationId], (err, locationResults) => {
        if (err) {
            console.error("Database error: ", err);
            return res.json({ success: false, error: "Database error" });
        }
        
        if (locationResults.length === 0) {
            return res.json({ success: false, error: "Location not found" });
        }
        
        db.query(sqlRooms, [locationId], (err, rooms) => {
            if (err) {
                console.error("Database error: ", err);
                return res.json({ success: false, error: "Database error" });
            }
            
            db.query(sqlClasses, [locationId], (err, classes) => {
                if (err) {
                    console.error("Database error: ", err);
                    return res.json({ success: false, error: "Database error" });
                }
                
                res.json({ 
                    success: true, 
                    location: locationResults[0],
                    rooms: rooms,
                    classes: classes
                });
            });
        });
    });
});

// Get rooms for a location (AJAX)
app.get("/admin/locations/:id/rooms", checkAuthenticated, checkAdmin, (req, res) => {
    const locationId = req.params.id;
    const sql = "SELECT * FROM rooms WHERE location_id = ? ORDER BY room_name";
    
    db.query(sql, [locationId], (err, rooms) => {
        if (err) {
            console.error("Database error: ", err);
            return res.json({ success: false, error: "Database error" });
        }
        
        res.json({ success: true, rooms: rooms });
    });
});

// Add new location
app.post("/admin/locations/add", (req, res, next) => {
    upload.single('locationImage')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            req.flash("error", "File upload error: " + err.message);
            return res.redirect("/admin/locations");
        } else if (err) {
            req.flash("error", err.message);
            return res.redirect("/admin/locations");
        }
        next();
    });
}, checkAuthenticated, checkAdmin, (req, res) => {
    const { name, address } = req.body;
    
    let image = 'defaultLocation.jpg';
    if (req.file) {
        image = req.file.filename;
    }

    if (!name || !address) {
        req.flash("error", "All fields are required.");
        return res.redirect("/admin/locations");
    }

    const sqlCheckLocation = "SELECT * FROM locations WHERE name = ?";
    db.query(sqlCheckLocation, [name], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Error checking location existence. Please try again.");
            return res.redirect("/admin/locations");
        }

        if (results.length > 0) {
            req.flash("error", "Location name already exists.");
            return res.redirect("/admin/locations");
        }

        const sqlInsertLocation = "INSERT INTO locations (name, address, image) VALUES (?, ?, ?)";
        db.query(sqlInsertLocation, [name, address, image], (err, result) => {
            if (err) {
                console.error("Database error: ", err);
                req.flash("error", "Error adding location. Please try again.");
                return res.redirect("/admin/locations");
            }

            req.flash("success", `Location "${name}" has been successfully added!`);
            res.redirect("/admin/locations");
        });
    });
});

// Update location
app.post("/admin/locations/:id/update", (req, res, next) => {
    upload.single('locationImage')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            req.flash("error", "File upload error: " + err.message);
            return res.redirect("/admin/locations");
        } else if (err) {
            req.flash("error", err.message);
            return res.redirect("/admin/locations");
        }
        next();
    });
}, checkAuthenticated, checkAdmin, (req, res) => {
    const locationId = req.params.id;
    const { name, address } = req.body;

    if (!name || !address) {
        req.flash("error", "All fields are required.");
        return res.redirect("/admin/locations");
    }

    const sqlCheckName = "SELECT * FROM locations WHERE name = ? AND location_id != ?";
    db.query(sqlCheckName, [name, locationId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Error checking location name availability. Please try again.");
            return res.redirect("/admin/locations");
        }

        if (results.length > 0) {
            req.flash("error", "Location name is already in use by another location.");
            return res.redirect("/admin/locations");
        }

        const sqlGetLocation = "SELECT * FROM locations WHERE location_id = ?";
        db.query(sqlGetLocation, [locationId], (err, locationResults) => {
            if (err) {
                console.error("Database error: ", err);
                req.flash("error", "Error fetching location data.");
                return res.redirect("/admin/locations");
            }

            if (locationResults.length === 0) {
                req.flash("error", "Location not found.");
                return res.redirect("/admin/locations");
            }

            const currentLocation = locationResults[0];
            
            let image = currentLocation.image;
            if (req.file) {
                image = req.file.filename;
            }

            const sqlUpdate = "UPDATE locations SET name = ?, address = ?, image = ? WHERE location_id = ?";
            db.query(sqlUpdate, [name, address, image, locationId], (err, result) => {
                if (err) {
                    console.error("Database error: ", err);
                    req.flash("error", "Error updating location. Please try again.");
                    return res.redirect("/admin/locations");
                }

                req.flash("success", `Location "${name}" has been successfully updated!`);
                res.redirect("/admin/locations");
            });
        });
    });
});

// Delete location
app.post("/admin/locations/:id/delete", checkAuthenticated, checkAdmin, (req, res) => {
    const locationId = req.params.id;

    const sqlGetLocation = "SELECT name FROM locations WHERE location_id = ?";
    db.query(sqlGetLocation, [locationId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Error fetching location data.");
            return res.redirect("/admin/locations");
        }

        if (results.length === 0) {
            req.flash("error", "Location not found.");
            return res.redirect("/admin/locations");
        }

        const locationName = results[0].name;

        const sqlDelete = "DELETE FROM locations WHERE location_id = ?";
        db.query(sqlDelete, [locationId], (err, result) => {
            if (err) {
                console.error("Database error: ", err);
                req.flash("error", "Error deleting location. Please try again.");
                return res.redirect("/admin/locations");
            }

            req.flash("success", `Location "${locationName}" has been successfully deleted.`);
            res.redirect("/admin/locations");
        });
    });
});

app.get("/admin/classes", checkAuthenticated, checkAdmin, (req, res) => {
    const renderData = {
        title: "KineGit | Manage Classes",
        user: req.session.user,
        messages: req.flash("success"),
        errors: req.flash("error"),
        classes: [],
        locations: []
    };

    if (!db || db.state === 'disconnected') {
        console.error("Database connection not available");
        return res.render("admin/panel/manageClasses", renderData);
    }

    const sqlClasses = `
        SELECT c.*, l.name as location_name, r.room_name,
               COUNT(b.booking_id) as booking_count
        FROM classes c
        JOIN locations l ON c.location_id = l.location_id
        JOIN rooms r ON c.room_id = r.room_id
        LEFT JOIN bookings b ON c.class_id = b.class_id AND b.status = 'Booked'
        GROUP BY c.class_id
        ORDER BY c.class_start_time ASC
    `;
    
    db.query(sqlClasses, (err, classes) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Error fetching classes data");
        } else {
            renderData.classes = classes || [];
        }

        const sqlLocations = "SELECT * FROM locations ORDER BY name ASC";
        db.query(sqlLocations, (err, locations) => {
            if (err) {
                console.error("Database error (locations): ", err);
            } else {
                renderData.locations = locations || [];
            }

            const sqlStats = `
                SELECT 
                    (SELECT COUNT(*) FROM classes WHERE class_start_time > NOW()) as upcomingClasses,
                    (SELECT COUNT(*) FROM bookings WHERE status = 'Booked') as totalBookings,
                    (SELECT COUNT(DISTINCT instructor_name) FROM classes) as totalInstructors
            `;
            
            db.query(sqlStats, (err, stats) => {
                if (err) {
                    console.error("Database error (stats): ", err);
                } else if (stats && stats[0]) {
                    renderData.stats = stats[0];
                }

                res.render("admin/panel/manageClasses", renderData);
            });
        });
    });
});

// Get class data for editing (AJAX)
app.get("/admin/classes/:id/edit-data", checkAuthenticated, checkAdmin, (req, res) => {
    const classId = req.params.id;
    
    const sqlClass = `
        SELECT c.*, l.name as location_name, r.room_name
        FROM classes c
        JOIN locations l ON c.location_id = l.location_id
        JOIN rooms r ON c.room_id = r.room_id
        WHERE c.class_id = ?
    `;
    
    db.query(sqlClass, [classId], (err, classResults) => {
        if (err) {
            console.error("Database error: ", err);
            return res.json({ success: false, error: "Database error" });
        }
        
        if (classResults.length === 0) {
            return res.json({ success: false, error: "Class not found" });
        }
        
        res.json({ 
            success: true, 
            class: classResults[0]
        });
    });
});

// Add new class
app.post("/admin/classes/add", checkAuthenticated, checkAdmin, (req, res) => {
    const { class_name, class_type, instructor_name, max_participants, location_id, room_id, class_start_time, class_end_time } = req.body;

    // Validation
    if (!class_name || !class_type || !instructor_name || !max_participants || !location_id || !room_id || !class_start_time || !class_end_time) {
        req.flash("error", "All fields are required.");
        return res.redirect("/admin/classes");
    }

    const maxParticipants = parseInt(max_participants);
    if (isNaN(maxParticipants) || maxParticipants < 1 || maxParticipants > 100) {
        req.flash("error", "Max participants must be between 1 and 100.");
        return res.redirect("/admin/classes");
    }

    const startTime = new Date(class_start_time);
    const endTime = new Date(class_end_time);
    
    if (endTime <= startTime) {
        req.flash("error", "End time must be after start time.");
        return res.redirect("/admin/classes");
    }

    const now = new Date();
    if (startTime <= now) {
        req.flash("error", "Class start time must be in the future.");
        return res.redirect("/admin/classes");
    }

    const sqlCheckAvailability = `
        SELECT * FROM classes 
        WHERE room_id = ? 
        AND (
            (class_start_time <= ? AND class_end_time > ?) OR
            (class_start_time < ? AND class_end_time >= ?) OR
            (class_start_time >= ? AND class_end_time <= ?)
        )
    `;
    
    db.query(sqlCheckAvailability, [room_id, class_start_time, class_start_time, class_end_time, class_end_time, class_start_time, class_end_time], (err, conflicts) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Error checking room availability. Please try again.");
            return res.redirect("/admin/classes");
        }

        if (conflicts.length > 0) {
            req.flash("error", "Room is not available during the selected time slot. Please choose a different time or room.");
            return res.redirect("/admin/classes");
        }

        const sqlInsertClass = "INSERT INTO classes (room_id, location_id, class_name, class_type, instructor_name, class_start_time, class_end_time, max_participants) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        db.query(sqlInsertClass, [room_id, location_id, class_name, class_type, instructor_name, class_start_time, class_end_time, maxParticipants], (err, result) => {
            if (err) {
                console.error("Database error: ", err);
                req.flash("error", "Error adding class. Please try again.");
                return res.redirect("/admin/classes");
            }

            req.flash("success", `Class "${class_name}" has been successfully added!`);
            res.redirect("/admin/classes");
        });
    });
});

// Update class
app.post("/admin/classes/:id/update", checkAuthenticated, checkAdmin, (req, res) => {
    const classId = req.params.id;
    const { class_name, class_type, instructor_name, max_participants, location_id, room_id, class_start_time, class_end_time } = req.body;

    if (!class_name || !class_type || !instructor_name || !max_participants || !location_id || !room_id || !class_start_time || !class_end_time) {
        req.flash("error", "All fields are required.");
        return res.redirect("/admin/classes");
    }

    const maxParticipants = parseInt(max_participants);
    if (isNaN(maxParticipants) || maxParticipants < 1 || maxParticipants > 100) {
        req.flash("error", "Max participants must be between 1 and 100.");
        return res.redirect("/admin/classes");
    }

    const startTime = new Date(class_start_time);
    const endTime = new Date(class_end_time);
    
    if (endTime <= startTime) {
        req.flash("error", "End time must be after start time.");
        return res.redirect("/admin/classes");
    }

    const sqlCheckBookings = "SELECT COUNT(*) as booking_count FROM bookings WHERE class_id = ? AND status = 'Booked'";
    db.query(sqlCheckBookings, [classId], (err, bookingResults) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Error checking current bookings.");
            return res.redirect("/admin/classes");
        }

        const currentBookings = bookingResults[0].booking_count;
        if (maxParticipants < currentBookings) {
            req.flash("error", `Cannot reduce max participants to ${maxParticipants} as there are already ${currentBookings} bookings for this class.`);
            return res.redirect("/admin/classes");
        }

        const sqlCheckAvailability = `
            SELECT * FROM classes 
            WHERE room_id = ? AND class_id != ?
            AND (
                (class_start_time <= ? AND class_end_time > ?) OR
                (class_start_time < ? AND class_end_time >= ?) OR
                (class_start_time >= ? AND class_end_time <= ?)
            )
        `;
        
        db.query(sqlCheckAvailability, [room_id, classId, class_start_time, class_start_time, class_end_time, class_end_time, class_start_time, class_end_time], (err, conflicts) => {
            if (err) {
                console.error("Database error: ", err);
                req.flash("error", "Error checking room availability. Please try again.");
                return res.redirect("/admin/classes");
            }

            if (conflicts.length > 0) {
                req.flash("error", "Room is not available during the selected time slot. Please choose a different time or room.");
                return res.redirect("/admin/classes");
            }

            const sqlUpdate = "UPDATE classes SET room_id = ?, location_id = ?, class_name = ?, class_type = ?, instructor_name = ?, class_start_time = ?, class_end_time = ?, max_participants = ? WHERE class_id = ?";
            db.query(sqlUpdate, [room_id, location_id, class_name, class_type, instructor_name, class_start_time, class_end_time, maxParticipants, classId], (err, result) => {
                if (err) {
                    console.error("Database error: ", err);
                    req.flash("error", "Error updating class. Please try again.");
                    return res.redirect("/admin/classes");
                }

                req.flash("success", `Class "${class_name}" has been successfully updated!`);
                res.redirect("/admin/classes");
            });
        });
    });
});

// Delete class
app.post("/admin/classes/:id/delete", checkAuthenticated, checkAdmin, (req, res) => {
    const classId = req.params.id;

    const sqlGetClass = "SELECT class_name FROM classes WHERE class_id = ?";
    db.query(sqlGetClass, [classId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            req.flash("error", "Error fetching class data.");
            return res.redirect("/admin/classes");
        }

        if (results.length === 0) {
            req.flash("error", "Class not found.");
            return res.redirect("/admin/classes");
        }

        const className = results[0].class_name;

        const sqlDeleteBookings = "DELETE FROM bookings WHERE class_id = ?";
        db.query(sqlDeleteBookings, [classId], (err, result) => {
            if (err) {
                console.error("Database error: ", err);
                req.flash("error", "Error deleting class bookings. Please try again.");
                return res.redirect("/admin/classes");
            }

            const sqlDeleteClass = "DELETE FROM classes WHERE class_id = ?";
            db.query(sqlDeleteClass, [classId], (err, result) => {
                if (err) {
                    console.error("Database error: ", err);
                    req.flash("error", "Error deleting class. Please try again.");
                    return res.redirect("/admin/classes");
                }

                req.flash("success", `Class "${className}" and all associated bookings have been successfully deleted.`);
                res.redirect("/admin/classes");
            });
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