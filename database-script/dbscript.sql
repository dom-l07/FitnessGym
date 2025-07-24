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
PRIMARY KEY (`id`));

-- Table `locations`
CREATE TABLE `locations` (
	`location_id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(20) NOT NULL,
	`address` VARCHAR(255) NOT NULL,
PRIMARY KEY (`location_id`));

-- Table `rooms`
CREATE TABLE `rooms` (
	`room_id` INT NOT NULL AUTO_INCREMENT,
    `location_id` INT NOT NULL,
    `room_name` VARCHAR(20) NOT NULL,
    `capacity` INT NOT NULL,
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



-- --------------------------------------------------------------------------------------
-- Sample Data
-- --------------------------------------------------------------------------------------
INSERT INTO `members` (username, email, password, address, contact, dob, role, gender) VALUES
("Lebron James", "james@gmail.com", "7c222fb2927d828af22f592134e8932480637c0d", "1 Woodlands Ave", 87654321, "2002-07-22", "admin", "Male"),
("Mary Tan", "mary@gmail.com", "7c222fb2927d828af22f592134e8932480637c0d", "Tampines Ave 1", 98765432, "2026-05-17", "user", "Female"),
("John Lim", "john@gmail.com", "7c222fb2927d828af22f592134e8932480637c0d", "2 Sembawang Rd", 91234182, "2005-01-20", "user", "Male"),
("Jamal Song", "jamal@gmail.com", "7c222fb2927d828af22f592134e8932480637c0d", "1 Novena Square", 95482378, "2000-04-18", "user", "Male");

INSERT INTO `locations` (name, address) VALUES
("Tampines", "Tampines Ave 2"),
("Woodlands", "Woodlands Ave 1"),
("Jurong East", "Jurong East St 21"),
("Orchard", "183 Orchard Road"),
("City Hall", "1 Raffles Link");

INSERT INTO `rooms` (location_id, room_name, capacity) VALUES
(1, "Cardio", 30),
(2, "Strength", 25),
(3, "Zumba", 40);

INSERT INTO `classes` (room_id, location_id, class_name, class_type, instructor_name, class_start_time, class_end_time, max_participants) VALUES
(1, 1, "Run & Done", "Cardio", "Mrs Joanana", "2025-08-02 14:30:00", "2025-08-02 16:30:00", 30),
(2, 2, "Lift to Live", "Strength", "Mr Joshua", "2025-08-07 17:00:00", "2025-08-07 18:30:00", 25),
(3, 3, "Zumba Singa", "Zumba", "Mrs Lau", "2025-08-20 10:45:00", "2025-08-20 13:00:00", 40),
(1, 1, "Zumba Roomba", "Zumba", "Mrs Tan", "2025-09-22 18:30:00", "2025-08-02 20:30:00", 30),
(2, 2, "Feel the Burn", "Cardio", "Mr Thomas", "2025-08-17 15:00:00", "2025-08-07 16:30:00", 25),
(3, 3, "Dominate the Game", "Strength", "Mr Toh", "2025-09-03 12:00:00", "2025-08-20 13:30:00", 15);