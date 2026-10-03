-- ============================================================
-- ShareSphere: Community Resource Sharing Platform
-- Complete MySQL Database Script
-- ============================================================

-- ------------------------------------------------------------
-- 0. Fresh database
-- ------------------------------------------------------------
DROP DATABASE IF EXISTS sharesphere;
CREATE DATABASE sharesphere;
USE sharesphere;

-- ------------------------------------------------------------
-- 1. Tables
-- ------------------------------------------------------------

CREATE TABLE `USER` (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    join_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

CREATE TABLE CATEGORY (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE `RESOURCE` (
    resource_id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    item_condition VARCHAR(50) NOT NULL,
    availability_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    location VARCHAR(150),

    CONSTRAINT fk_resource_owner
        FOREIGN KEY (owner_id) REFERENCES `USER`(user_id),

    CONSTRAINT fk_resource_category
        FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id),

    CHECK (item_condition IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR')),
    CHECK (availability_status IN ('AVAILABLE', 'BORROWED', 'MAINTENANCE'))
);

CREATE TABLE BORROW_REQUEST (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    borrower_id INT NOT NULL,
    resource_id INT NOT NULL,
    request_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    message VARCHAR(500),

    CONSTRAINT fk_request_borrower
        FOREIGN KEY (borrower_id) REFERENCES `USER`(user_id),

    CONSTRAINT fk_request_resource
        FOREIGN KEY (resource_id) REFERENCES `RESOURCE`(resource_id),

    CHECK (end_date >= start_date),
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
);

CREATE TABLE BORROW_TRANSACTION (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT fk_transaction_request
        FOREIGN KEY (request_id) REFERENCES BORROW_REQUEST(request_id),

    CHECK (due_date >= issue_date),
    CHECK (return_date IS NULL OR return_date >= issue_date),
    CHECK (status IN ('ACTIVE', 'RETURNED', 'OVERDUE'))
);

CREATE TABLE DEPOSIT (
    deposit_id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    CONSTRAINT fk_deposit_transaction
        FOREIGN KEY (transaction_id) REFERENCES BORROW_TRANSACTION(transaction_id),

    CHECK (amount >= 0),
    CHECK (status IN ('PENDING', 'HELD', 'REFUNDED', 'FORFEITED'))
);

CREATE TABLE FEEDBACK (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    comments VARCHAR(500),
    feedback_date DATE NOT NULL,

    CONSTRAINT fk_feedback_transaction
        FOREIGN KEY (transaction_id) REFERENCES BORROW_TRANSACTION(transaction_id),

    CONSTRAINT fk_feedback_user
        FOREIGN KEY (user_id) REFERENCES `USER`(user_id),

    CONSTRAINT uq_feedback_transaction_user
        UNIQUE (transaction_id, user_id),

    CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE DAMAGE_REPORT (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    reported_by INT NOT NULL,
    damage_type VARCHAR(100),
    description VARCHAR(500),
    reported_date DATE NOT NULL,
    estimated_cost DECIMAL(10,2),
    status VARCHAR(30) NOT NULL DEFAULT 'REPORTED',

    CONSTRAINT fk_damage_transaction
        FOREIGN KEY (transaction_id) REFERENCES BORROW_TRANSACTION(transaction_id),

    CONSTRAINT fk_damage_user
        FOREIGN KEY (reported_by) REFERENCES `USER`(user_id),

    CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
    CHECK (status IN ('REPORTED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'))
);

-- ------------------------------------------------------------
-- 2. Indexes
-- ------------------------------------------------------------

CREATE INDEX idx_resource_owner
    ON `RESOURCE`(owner_id);

CREATE INDEX idx_resource_category
    ON `RESOURCE`(category_id);

CREATE INDEX idx_resource_availability
    ON `RESOURCE`(availability_status);

CREATE INDEX idx_request_borrower
    ON BORROW_REQUEST(borrower_id);

CREATE INDEX idx_request_resource
    ON BORROW_REQUEST(resource_id);

CREATE INDEX idx_request_status
    ON BORROW_REQUEST(status);

CREATE INDEX idx_transaction_status
    ON BORROW_TRANSACTION(status);

CREATE INDEX idx_feedback_transaction
    ON FEEDBACK(transaction_id);

CREATE INDEX idx_damage_transaction
    ON DAMAGE_REPORT(transaction_id);

-- ------------------------------------------------------------
-- 3. Sample users
-- ------------------------------------------------------------

INSERT INTO `USER`
(name, email, phone, password, address, join_date, status)
VALUES
('Arjun Kumar', 'arjun@gmail.com', '9876501001', 'password123',
 'SRM Hostel Block A', '2026-06-01', 'ACTIVE'),
('Priya Sharma', 'priya@gmail.com', '9876501002', 'password123',
 'SRM Hostel Block B', '2026-06-03', 'ACTIVE'),
('Rahul Verma', 'rahul@gmail.com', '9876501003', 'password123',
 'SRM Hostel Block C', '2026-06-05', 'ACTIVE'),
('Sneha Reddy', 'sneha@gmail.com', '9876501004', 'password123',
 'SRM Hostel Block D', '2026-06-07', 'ACTIVE'),
('Karthik Rao', 'karthik@gmail.com', '9876501005', 'password123',
 'Potheri Campus Area', '2026-06-10', 'ACTIVE'),
('Ananya Singh', 'ananya@gmail.com', '9876501006', 'password123',
 'SRM Hostel Block A', '2026-06-12', 'ACTIVE'),
('Vikram Patel', 'vikram@gmail.com', '9876501007', 'password123',
 'SRM Hostel Block E', '2026-06-15', 'ACTIVE'),
('Meera Nair', 'meera@gmail.com', '9876501008', 'password123',
 'Potheri Main Road', '2026-06-18', 'ACTIVE'),
('Aditya Das', 'aditya@gmail.com', '9876501009', 'password123',
 'SRM Hostel Block C', '2026-06-20', 'ACTIVE'),
('Divya Krishnan', 'divya@gmail.com', '9876501010', 'password123',
 'SRM Hostel Block B', '2026-06-22', 'ACTIVE');

-- ------------------------------------------------------------
-- 4. Categories
-- ------------------------------------------------------------

INSERT INTO CATEGORY
(category_name, description)
VALUES
('Books', 'Academic, reference and general reading books'),
('Electronics', 'Electronic devices and accessories'),
('Sports Equipment', 'Equipment used for indoor and outdoor sports'),
('Tools', 'Hand tools and basic equipment'),
('Musical Instruments', 'Musical instruments and accessories'),
('Stationery', 'Academic and office stationery'),
('Photography', 'Cameras, tripods and photography accessories'),
('Travel Equipment', 'Items useful for travel and outdoor activities');

-- ------------------------------------------------------------
-- 5. Resources
-- ------------------------------------------------------------

INSERT INTO `RESOURCE`
(owner_id, category_id, title, description, item_condition,
 availability_status, location)
VALUES
(1, 1, 'Data Structures and Algorithms Book',
 'Complete reference book for DSA and competitive programming',
 'GOOD', 'AVAILABLE', 'Hostel Block A'),

(1, 2, 'HP Scientific Calculator',
 'Scientific calculator suitable for engineering mathematics',
 'EXCELLENT', 'AVAILABLE', 'Hostel Block A'),

(2, 3, 'Badminton Racket',
 'Yonex badminton racket with cover',
 'GOOD', 'AVAILABLE', 'Hostel Block B'),

(2, 5, 'Acoustic Guitar',
 'Six-string acoustic guitar suitable for beginners',
 'GOOD', 'AVAILABLE', 'Hostel Block B'),

(3, 2, 'Arduino Uno Kit',
 'Arduino board with sensors and jumper wires',
 'EXCELLENT', 'AVAILABLE', 'Hostel Block C'),

(3, 7, 'Canon DSLR Camera',
 'DSLR camera suitable for college events and photography',
 'GOOD', 'BORROWED', 'Hostel Block C'),

(4, 3, 'Football',
 'Standard size football for outdoor games',
 'GOOD', 'AVAILABLE', 'Hostel Block D'),

(4, 4, 'Electric Drill Machine',
 'Cordless drill machine with multiple drill bits',
 'GOOD', 'AVAILABLE', 'Hostel Block D'),

(5, 1, 'Python Programming Book',
 'Python programming textbook for beginners',
 'EXCELLENT', 'AVAILABLE', 'Potheri Campus'),

(5, 7, 'Camera Tripod',
 'Adjustable tripod for cameras and smartphones',
 'GOOD', 'AVAILABLE', 'Potheri Campus'),

(6, 6, 'Drawing Tablet',
 'Digital drawing tablet with stylus',
 'EXCELLENT', 'BORROWED', 'Hostel Block A'),

(7, 3, 'Cricket Bat',
 'English willow cricket bat',
 'GOOD', 'AVAILABLE', 'Hostel Block E'),

(8, 8, 'Travel Backpack',
 'Large capacity backpack suitable for short trips',
 'GOOD', 'AVAILABLE', 'Potheri Main Road'),

(9, 4, 'Screwdriver Set',
 'Multi-size precision screwdriver set',
 'EXCELLENT', 'AVAILABLE', 'Hostel Block C'),

(10, 2, 'Bluetooth Speaker',
 'Portable wireless Bluetooth speaker',
 'GOOD', 'AVAILABLE', 'Hostel Block B');

-- ------------------------------------------------------------
-- 6. Borrow requests
-- ------------------------------------------------------------

INSERT INTO BORROW_REQUEST
(borrower_id, resource_id, request_date, start_date, end_date, status, message)
VALUES
(2, 1, '2026-08-01', '2026-08-02', '2026-08-07',
 'APPROVED', 'I need this book for my DSA preparation.'),

(3, 3, '2026-08-03', '2026-08-04', '2026-08-06',
 'APPROVED', 'I would like to use the racket for a college tournament.'),

(4, 5, '2026-08-05', '2026-08-06', '2026-08-10',
 'APPROVED', 'Need the Arduino kit for my mini project.'),

(5, 6, '2026-08-07', '2026-08-08', '2026-08-12',
 'APPROVED', 'Need the DSLR camera for a college event.'),

(6, 4, '2026-08-10', '2026-08-11', '2026-08-15',
 'REJECTED', 'I would like to borrow the guitar for a cultural event.'),

(7, 8, '2026-08-12', '2026-08-13', '2026-08-16',
 'APPROVED', 'Need the drill for a small repair project.'),

(8, 9, '2026-08-14', '2026-08-15', '2026-08-20',
 'APPROVED', 'I need this Python book for my programming course.'),

(9, 11, '2026-08-16', '2026-08-17', '2026-08-21',
 'APPROVED', 'Need the drawing tablet for a design assignment.'),

(10, 12, '2026-08-18', '2026-08-19', '2026-08-23',
 'PENDING', 'I need the cricket bat for sports practice.'),

(1, 15, '2026-08-20', '2026-08-21', '2026-08-25',
 'PENDING', 'I need the speaker for a small event.'),

(3, 2, '2026-08-22', '2026-08-23', '2026-08-24',
 'REJECTED', 'Need the calculator for my mathematics exam.'),

(4, 10, '2026-08-24', '2026-08-25', '2026-08-27',
 'APPROVED', 'Need the tripod for photography during our event.'),

(6, 7, '2026-08-25', '2026-08-26', '2026-08-28',
 'PENDING', 'I would like to borrow the football.'),

(7, 14, '2026-08-26', '2026-08-27', '2026-08-30',
 'APPROVED', 'Need the screwdriver set for repairing my bicycle.'),

(8, 13, '2026-08-27', '2026-08-28', '2026-09-02',
 'APPROVED', 'I need the backpack for a short trip.');

-- ------------------------------------------------------------
-- 7. Borrow transactions
-- ------------------------------------------------------------

INSERT INTO BORROW_TRANSACTION
(request_id, issue_date, due_date, return_date, status)
VALUES
(1, '2026-08-02', '2026-08-07', '2026-08-07', 'RETURNED'),
(2, '2026-08-04', '2026-08-06', '2026-08-06', 'RETURNED'),
(3, '2026-08-06', '2026-08-10', '2026-08-10', 'RETURNED'),
(4, '2026-08-08', '2026-08-12', NULL, 'ACTIVE'),
(6, '2026-08-13', '2026-08-16', '2026-08-16', 'RETURNED'),
(7, '2026-08-15', '2026-08-20', '2026-08-20', 'RETURNED'),
(8, '2026-08-17', '2026-08-21', NULL, 'ACTIVE'),
(12, '2026-08-25', '2026-08-27', NULL, 'ACTIVE'),
(14, '2026-08-27', '2026-08-30', '2026-08-30', 'RETURNED'),
(15, '2026-08-28', '2026-09-02', '2026-09-02', 'RETURNED');

-- ------------------------------------------------------------
-- 8. Deposits
-- ------------------------------------------------------------

INSERT INTO DEPOSIT
(transaction_id, amount, payment_date, status)
VALUES
(1, 300.00, '2026-08-02', 'REFUNDED'),
(4, 2000.00, '2026-08-08', 'HELD'),
(8, 1500.00, '2026-08-17', 'HELD'),
(10, 500.00, '2026-08-28', 'REFUNDED');

-- ------------------------------------------------------------
-- 9. Feedback
-- ------------------------------------------------------------

INSERT INTO FEEDBACK
(transaction_id, user_id, rating, comments, feedback_date)
VALUES
(1, 2, 5, 'The book was very useful for my DSA preparation.', '2026-08-07'),
(2, 3, 4, 'The racket was in good condition.', '2026-08-06'),
(3, 4, 5, 'The Arduino kit had all the required components.', '2026-08-10'),
(5, 7, 4, 'The drill worked properly and was easy to use.', '2026-08-16'),
(6, 8, 5, 'The Python book was very helpful.', '2026-08-20'),
(9, 7, 4, 'The screwdriver set was useful for my repair work.', '2026-08-30'),
(10, 8, 5, 'The backpack was spacious and comfortable.', '2026-09-02');

-- ------------------------------------------------------------
-- 10. Damage reports
-- ------------------------------------------------------------

INSERT INTO DAMAGE_REPORT
(transaction_id, reported_by, damage_type, description,
 reported_date, estimated_cost, status)
VALUES
(2, 2, 'Minor Scratch',
 'Small scratch found on the racket frame.',
 '2026-08-06', 150.00, 'RESOLVED'),

(5, 7, 'Surface Damage',
 'Minor scratches found on the drill body.',
 '2026-08-16', 300.00, 'RESOLVED'),

(9, 7, 'Missing Part',
 'One screwdriver bit was missing after return.',
 '2026-08-30', 100.00, 'REPORTED');

-- ------------------------------------------------------------
-- 11. Synchronize resource availability with existing transactions
-- ------------------------------------------------------------

UPDATE `RESOURCE` r
JOIN BORROW_REQUEST br
    ON r.resource_id = br.resource_id
JOIN BORROW_TRANSACTION bt
    ON br.request_id = bt.request_id
SET r.availability_status =
    CASE
        WHEN bt.return_date IS NULL
             AND bt.status IN ('ACTIVE', 'OVERDUE')
        THEN 'BORROWED'
        ELSE 'AVAILABLE'
    END;

-- ------------------------------------------------------------
-- 12. Views
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW AVAILABLE_RESOURCES AS
SELECT
    r.resource_id,
    r.title,
    r.description,
    r.item_condition,
    r.location,
    u.name AS owner_name,
    c.category_name
FROM `RESOURCE` r
JOIN `USER` u
    ON r.owner_id = u.user_id
JOIN CATEGORY c
    ON r.category_id = c.category_id
WHERE r.availability_status = 'AVAILABLE';

CREATE OR REPLACE VIEW BORROWING_HISTORY AS
SELECT
    bt.transaction_id,
    br.request_id,
    borrower.name AS borrower_name,
    owner.name AS owner_name,
    r.title AS resource,
    c.category_name,
    bt.issue_date,
    bt.due_date,
    bt.return_date,
    bt.status AS transaction_status
FROM BORROW_TRANSACTION bt
JOIN BORROW_REQUEST br
    ON bt.request_id = br.request_id
JOIN `USER` borrower
    ON br.borrower_id = borrower.user_id
JOIN `RESOURCE` r
    ON br.resource_id = r.resource_id
JOIN `USER` owner
    ON r.owner_id = owner.user_id
JOIN CATEGORY c
    ON r.category_id = c.category_id;

CREATE OR REPLACE VIEW RESOURCE_RATINGS AS
SELECT
    r.resource_id,
    r.title,
    COUNT(f.feedback_id) AS total_reviews,
    ROUND(AVG(f.rating), 2) AS average_rating
FROM `RESOURCE` r
LEFT JOIN BORROW_REQUEST br
    ON r.resource_id = br.resource_id
LEFT JOIN BORROW_TRANSACTION bt
    ON br.request_id = bt.request_id
LEFT JOIN FEEDBACK f
    ON bt.transaction_id = f.transaction_id
GROUP BY r.resource_id, r.title;

-- ------------------------------------------------------------
-- 13. Triggers
-- ------------------------------------------------------------

DELIMITER //

CREATE TRIGGER trg_transaction_created
AFTER INSERT ON BORROW_TRANSACTION
FOR EACH ROW
BEGIN
    UPDATE `RESOURCE` r
    JOIN BORROW_REQUEST br
        ON r.resource_id = br.resource_id
    SET r.availability_status = 'BORROWED'
    WHERE br.request_id = NEW.request_id;
END //

CREATE TRIGGER trg_transaction_returned
AFTER UPDATE ON BORROW_TRANSACTION
FOR EACH ROW
BEGIN
    IF (
        OLD.return_date IS NULL
        AND NEW.return_date IS NOT NULL
    )
    OR (
        OLD.status <> 'RETURNED'
        AND NEW.status = 'RETURNED'
    ) THEN
        UPDATE `RESOURCE` r
        JOIN BORROW_REQUEST br
            ON r.resource_id = br.resource_id
        SET r.availability_status = 'AVAILABLE'
        WHERE br.request_id = NEW.request_id;
    END IF;
END //

DELIMITER ;

-- ------------------------------------------------------------
-- 14. Stored procedures
-- ------------------------------------------------------------

DELIMITER //

CREATE PROCEDURE BORROW_RESOURCE(
    IN p_request_id INT,
    IN p_issue_date DATE,
    IN p_due_date DATE
)
BEGIN
    DECLARE v_status VARCHAR(30);
    DECLARE v_resource_id INT;
    DECLARE v_availability VARCHAR(30);
    DECLARE v_transaction_count INT;

    SELECT status, resource_id
    INTO v_status, v_resource_id
    FROM BORROW_REQUEST
    WHERE request_id = p_request_id;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Borrow request does not exist';

    ELSEIF v_status <> 'APPROVED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Borrow request is not approved';
    END IF;

    SELECT COUNT(*)
    INTO v_transaction_count
    FROM BORROW_TRANSACTION
    WHERE request_id = p_request_id;

    IF v_transaction_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction already exists for this request';
    END IF;

    SELECT availability_status
    INTO v_availability
    FROM `RESOURCE`
    WHERE resource_id = v_resource_id;

    IF v_availability <> 'AVAILABLE' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Resource is currently unavailable';
    END IF;

    IF p_due_date < p_issue_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Due date cannot be before issue date';
    END IF;

    INSERT INTO BORROW_TRANSACTION
    (request_id, issue_date, due_date, return_date, status)
    VALUES
    (p_request_id, p_issue_date, p_due_date, NULL, 'ACTIVE');
END //

CREATE PROCEDURE RETURN_RESOURCE(
    IN p_transaction_id INT,
    IN p_return_date DATE
)
BEGIN
    DECLARE v_status VARCHAR(30);
    DECLARE v_issue_date DATE;

    SELECT status, issue_date
    INTO v_status, v_issue_date
    FROM BORROW_TRANSACTION
    WHERE transaction_id = p_transaction_id;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction does not exist';

    ELSEIF v_status = 'RETURNED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Resource has already been returned';

    ELSEIF p_return_date < v_issue_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Return date cannot be before issue date';

    ELSE
        UPDATE BORROW_TRANSACTION
        SET
            return_date = p_return_date,
            status = 'RETURNED'
        WHERE transaction_id = p_transaction_id;
    END IF;
END //

DELIMITER ;

-- ------------------------------------------------------------
-- 15. Verification queries
-- ------------------------------------------------------------

SELECT COUNT(*) AS total_users FROM `USER`;
SELECT COUNT(*) AS total_categories FROM CATEGORY;
SELECT COUNT(*) AS total_resources FROM `RESOURCE`;
SELECT COUNT(*) AS total_requests FROM BORROW_REQUEST;
SELECT COUNT(*) AS total_transactions FROM BORROW_TRANSACTION;
SELECT COUNT(*) AS total_deposits FROM DEPOSIT;
SELECT COUNT(*) AS total_feedback FROM FEEDBACK;
SELECT COUNT(*) AS total_damage_reports FROM DAMAGE_REPORT;

SELECT * FROM AVAILABLE_RESOURCES;
SELECT * FROM BORROWING_HISTORY;
SELECT * FROM RESOURCE_RATINGS;

SHOW INDEX FROM `RESOURCE`;
SHOW TRIGGERS;
SHOW PROCEDURE STATUS WHERE Db = 'sharesphere';

-- ============================================================
-- End of ShareSphere.sql
-- ============================================================
