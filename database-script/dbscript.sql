USE `CA2FitnessGym_metdevelop`;

-- Table `members`
CREATE TABLE `members` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`username` VARCHAR(25) NOT NULL,
	`email` VARCHAR(255) NOT NULL,
	`password` VARCHAR(255) NOT NULL,
	`address` VARCHAR(255) NOT NULL,
	`contact` VARCHAR(10) NOT NULL,
	`dob` DATE NOT NULL,
	`role` ENUM('user', 'admin') DEFAULT 'user',
    `gender` ENUM('Male', 'Female') NOT NULL,
    `profile_picture` VARCHAR(255) DEFAULT 'defaultProfilePicture.jpg',
PRIMARY KEY (`id`));

-- Table `locations`
CREATE TABLE `locations` (
	`location_id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(20) NOT NULL,
	`address` VARCHAR(255) NOT NULL,
    `image` VARCHAR(50) NOT NULL,
PRIMARY KEY (`location_id`));

-- Table `rooms`
CREATE TABLE `rooms` (
	`room_id` INT NOT NULL AUTO_INCREMENT,
    `location_id` INT NOT NULL,
    `room_name` VARCHAR(20) NOT NULL,
    `capacity` INT NOT NULL,
    `image` VARCHAR(50) NOT NULL,
PRIMARY KEY (`room_id`),
FOREIGN KEY (`location_id`) REFERENCES `locations`(`location_id`));

-- Table `classes`
CREATE TABLE `classes` (
	`class_id` INT NOT NULL AUTO_INCREMENT,
    `room_id` INT NOT NULL,
    `location_id` INT NOT NULL,
    `class_name` VARCHAR(20) NOT NULL,
    `class_type` VARCHAR(20) NOT NULL,
    `instructor_name` VARCHAR(20) NOT NULL,
    `class_start_time` DATETIME NOT NULL,
    `class_end_time` DATETIME NOT NULL,
    `max_participants` INT NOT NULL,
PRIMARY KEY (`class_id`),
FOREIGN KEY (`room_id`) REFERENCES `rooms`(`room_id`),
FOREIGN KEY (`location_id`) REFERENCES `locations`(`location_id`));

-- Table `bookings`
CREATE TABLE `bookings` (
	`booking_id` INT NOT NULL AUTO_INCREMENT,
    `member_id` INT NOT NULL,
    `class_id` INT NOT NULL,
    `booking_date` DATE NOT NULL,
    `status` ENUM('Booked', 'Cancelled', 'Completed') NOT NULL,
PRIMARY KEY (`booking_id`),
FOREIGN KEY (`member_id`) REFERENCES `members`(`id`),
FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`));

-- Table `billings`
CREATE TABLE `billings` (
	`billing_id` INT NOT NULL AUTO_INCREMENT,
    `member_id` INT NOT NULL,
    `billing_date` DATE NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `payment_status` ENUM('Paid', 'Pending') NOT NULL,
    `payment_date` DATE,
    `payment_method` VARCHAR(50),
PRIMARY KEY (`billing_id`),
FOREIGN KEY (`member_id`) REFERENCES `members`(`id`));


-- Additional tables for payment methods and wallet functionality

-- Table `payment_methods`
CREATE TABLE `payment_methods` (
    `payment_method_id` INT NOT NULL AUTO_INCREMENT,
    `member_id` INT NOT NULL,
    `method_type` ENUM('Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer') NOT NULL,
    `cardholder_name` VARCHAR(100),
    `card_number_last4` VARCHAR(4),
    `expiry_date` VARCHAR(5),
    `paypal_email` VARCHAR(255),
    `account_number` VARCHAR(50),
    `bank_name` VARCHAR(100),
    `is_default` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`payment_method_id`),
    FOREIGN KEY (`member_id`) REFERENCES `members`(`id`)
);

-- Table `wallet`
CREATE TABLE `wallet` (
    `wallet_id` INT NOT NULL AUTO_INCREMENT,
    `member_id` INT NOT NULL UNIQUE,
    `balance` DECIMAL(10, 2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`wallet_id`),
    FOREIGN KEY (`member_id`) REFERENCES `members`(`id`)
);

-- Table `waller_transactions`
CREATE TABLE `wallet_transactions` (
    `transaction_id` INT NOT NULL AUTO_INCREMENT,
    `member_id` INT NOT NULL,
    `transaction_type` ENUM('Add Funds', 'Payment', 'Refund', 'Fee') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `description` VARCHAR(255),
    `payment_method_id` INT,
    `transaction_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('Completed', 'Pending', 'Failed') DEFAULT 'Completed',
    PRIMARY KEY (`transaction_id`),
    FOREIGN KEY (`member_id`) REFERENCES `members`(`id`),
    FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`payment_method_id`)
);

-- Table `membership_plans`
CREATE TABLE IF NOT EXISTS membership_plans (
	plan_id INT NOT NULL AUTO_INCREMENT,
	plan_name VARCHAR(50) NOT NULL,
	price DECIMAL(10, 2) NOT NULL,
    features TEXT,
	PRIMARY KEY (plan_id)
);
    
-- Table `membership_subscriptions`
CREATE TABLE IF NOT EXISTS membership_subscriptions (
	subscription_id INT NOT NULL AUTO_INCREMENT,
	member_id INT NOT NULL,
	plan_id INT NOT NULL,
	start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	status ENUM('Active', 'Cancelled') DEFAULT 'Active',
    PRIMARY KEY (subscription_id),
	FOREIGN KEY (member_id) REFERENCES members(id),
	FOREIGN KEY (plan_id) REFERENCES membership_plans(plan_id)
);



-- --------------------------------------------------------------------------------------
-- Sample Data
-- --------------------------------------------------------------------------------------
INSERT INTO `members` (username, email, password, address, contact, dob, role, gender) VALUES
("Lebron James", "james@gmail.com", "7c222fb2927d828af22f592134e8932480637c0d", "1 Woodlands Ave", 87654321, "2002-07-22", "admin", "Male"),
("Mary Tan", "mary@gmail.com", "7c222fb2927d828af22f592134e8932480637c0d", "Tampines Ave 1", 98765432, "2026-05-17", "user", "Female"),
("John Lim", "john@gmail.com", "7c222fb2927d828af22f592134e8932480637c0d", "2 Sembawang Rd", 91234182, "2005-01-20", "user", "Male"),
("Jamal Song", "jamal@gmail.com", "7c222fb2927d828af22f592134e8932480637c0d", "1 Novena Square", 95482378, "2000-04-18", "user", "Male");

INSERT INTO `locations` (name, address, image) VALUES
("Tampines", "Tampines Ave 2", "tampinesBranch.jpg"),
("Woodlands", "Woodlands Ave 1", "woodlandsBranch.jpg"),
("Jurong East", "Jurong East St 21", "jurongeastBranch.jpg"),
("Orchard", "183 Orchard Road", "orchardBranch.jpg"),
("City Hall", "1 Raffles Link", "cityhallBranch.jpg");

INSERT INTO `rooms` (location_id, room_name, capacity, image) VALUES
(1, "Cardio", 30, "cardioRoom1.jpg"),
(1, "Strength", 25, "strengthRoom1.jpg"),
(2, "Cardio", 25, "cardioRoom2.jpg"),
(2, "Strength", 15, "strengthRoom2.jpg"),
(2, "Zumba", 30, "zumbaRoom1.jpg"),
(3, "Strength", 20, "strengthRoom3.jpg"),
(3, "Zumba", 35, "zumbaRoom2.jpg"),
(4, "Cardio", 25, "cardioRoom3.jpg"),
(4, "Strength", 20, "strengthRoom4.jpg"),
(4, "Zumba", 30, "zumbaRoom3.jpg"),
(5, "Cardio", 20, "cardioRoom4.jpg"),
(5, "Zumba", 15, "zumbaRoom4.jpg");


INSERT INTO `classes` (room_id, location_id, class_name, class_type, instructor_name, class_start_time, class_end_time, max_participants) VALUES
(1, 1, "Run & Done", "Cardio", "Mrs Joanana", "2025-08-02 14:30:00", "2025-08-02 16:30:00", 30),
(2, 2, "Lift to Live", "Strength", "Mr Joshua", "2025-08-07 17:00:00", "2025-08-07 18:30:00", 25),
(3, 3, "Zumba Singa", "Zumba", "Mrs Lau", "2025-08-20 10:45:00", "2025-08-20 13:00:00", 40),
(1, 1, "Zumba Roomba", "Zumba", "Mrs Tan", "2025-09-22 18:30:00", "2025-09-22 20:30:00", 30),
(2, 2, "Feel the Burn", "Cardio", "Mr Thomas", "2025-08-17 15:00:00", "2025-08-17 16:30:00", 25),
(3, 3, "Dominate the Game", "Strength", "Mr Toh", "2025-09-03 12:00:00", "2025-09-03 13:30:00", 15),
(8, 4, "Super Legs", "Cardio", "Mrs Thomson", "2025-09-02 14:30:00", "2025-09-02 16:30:00", 30),
(9, 4, "Superhuman Strength", "Strength", "Mr Joshua", "2025-08-07 17:00:00", "2025-08-07 18:30:00", 25),
(12, 5, "Bim Bam Boom", "Zumba", "Mrs Liu", "2025-08-20 10:45:00", "2025-08-20 13:00:00", 40),
(12, 5, "Zoom Zoom", "Zumba", "Mrs Lim", "2025-09-22 18:30:00", "2025-09-22 20:30:00", 30);

-- Add wallet entry for existing members (run this after creating the tables)
INSERT INTO `wallet` (`member_id`, `balance`) 
SELECT `id`, 0.00 FROM `members` 
WHERE `id` NOT IN (SELECT `member_id` FROM `wallet`);

-- Update existing members to have default profile picture
UPDATE `members` 
SET `profile_picture` = 'defaultProfilePicture.jpg' 
WHERE `profile_picture` IS NULL OR `profile_picture` = '';