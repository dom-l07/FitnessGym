USE `CA2FitnessGym_metdevelop`;

-- ------------------------------------------------------------------
-- Table `members`
-- ------------------------------------------------------------------
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

-- ------------------------------------------------------------------
-- Table `locations`
-- ------------------------------------------------------------------
CREATE TABLE `locations` (
	`location_id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(20) NOT NULL,
	`address` VARCHAR(255) NOT NULL,
PRIMARY KEY (`location_id`));

-- ------------------------------------------------------------------
-- Table `rooms`
-- ------------------------------------------------------------------
CREATE TABLE `rooms` (
	`room_id` INT NOT NULL AUTO_INCREMENT,
    `location_id` INT NOT NULL,
    `room_name` VARCHAR(20) NOT NULL,
    `capacity` INT NOT NULL,
PRIMARY KEY (`room_id`),
FOREIGN KEY (`location_id`) REFERENCES `locations`(`location_id`));

-- ------------------------------------------------------------------
-- Table `classes`
-- ------------------------------------------------------------------
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

-- ------------------------------------------------------------------
-- Table `bookings`
-- ------------------------------------------------------------------
CREATE TABLE `bookings` (
	`booking_id` INT NOT NULL AUTO_INCREMENT,
    `member_id` INT NOT NULL,
    `class_id` INT NOT NULL,
    `booking_date` DATE NOT NULL,
    `status` ENUM('Booked', 'Cancelled', 'Completed') NOT NULL,
PRIMARY KEY (`booking_id`),
FOREIGN KEY (`member_id`) REFERENCES `members`(`id`),
FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`));

-- ------------------------------------------------------------------
-- Table `billings`
-- ------------------------------------------------------------------
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