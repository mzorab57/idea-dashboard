-- =====================================================
-- IDEA FOUNDATION - Hostinger Import (MySQL)
-- Notes:
-- - Import into the selected database (do NOT include CREATE DATABASE/USE)
-- - Charset: utf8mb4, Engine: InnoDB
-- - Safe on repeated imports (IF NOT EXISTS where applicable)
-- =====================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Users (Admin/Employee)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employee') DEFAULT 'employee',
    is_active TINYINT(1) DEFAULT 1,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cat_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Subcategories
CREATE TABLE IF NOT EXISTS subcategories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_subcat_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Authors
CREATE TABLE IF NOT EXISTS authors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    image VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FULLTEXT(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Books
CREATE TABLE IF NOT EXISTS books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    long_description TEXT,
    category_id INT NULL,
    subcategory_id INT NULL,
    file_key VARCHAR(500),
    view_count INT DEFAULT 0,
    thumbnail VARCHAR(255),
    download_count INT DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    meta_title VARCHAR(150),
    meta_description VARCHAR(255),
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_book_active_feat (is_active, is_featured),
    INDEX idx_book_slug (slug),
    FULLTEXT(title, short_description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Book Authors (Many-to-Many)
CREATE TABLE IF NOT EXISTS book_authors (
    book_id INT NOT NULL,
    author_id INT NOT NULL,
    role ENUM('author', 'translator', 'editor') DEFAULT 'author',
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Book Specifications
CREATE TABLE IF NOT EXISTS book_specifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    spec_name VARCHAR(100) NOT NULL,
    spec_value TEXT NOT NULL,
    `group` VARCHAR(100) NULL,
    is_visible TINYINT(1) DEFAULT 1,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_spec_book (book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Public Logs (views/downloads)
CREATE TABLE IF NOT EXISTS logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    action_type ENUM('view', 'download') NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_logs_ip_time (ip_address, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin Action Logs
CREATE TABLE IF NOT EXISTS admin_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action_type ENUM('create', 'update', 'delete', 'login') NOT NULL,
    description TEXT,
    table_name VARCHAR(50),
    record_id INT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Settings
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Views
DROP VIEW IF EXISTS full_book_details;
CREATE VIEW full_book_details AS
SELECT
    b.*,
    c.name AS category_name,
    s.name AS subcategory_name,
    u.full_name AS uploader_name,
    GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS author_names
FROM books b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN subcategories s ON b.subcategory_id = s.id
LEFT JOIN users u ON b.created_by = u.id
LEFT JOIN book_authors ba ON b.id = ba.book_id
LEFT JOIN authors a ON ba.author_id = a.id
GROUP BY b.id;

DROP VIEW IF EXISTS dashboard_summary;
CREATE VIEW dashboard_summary AS
SELECT
    (SELECT COUNT(*) FROM books WHERE is_active = 1) AS total_active_books,
    (SELECT COUNT(*) FROM logs WHERE action_type = 'download') AS total_downloads,
    (SELECT COUNT(DISTINCT ip_address) FROM logs) AS unique_visitors,
    (SELECT COUNT(*) FROM authors WHERE is_active = 1) AS total_authors,
    (SELECT COUNT(*) FROM logs WHERE DATE(created_at) = CURDATE() AND action_type = 'download') AS downloads_today;

-- Sample Data (safe defaults)
INSERT INTO users (full_name, email, password, role, is_active)
VALUES
('Main Admin', 'admin@idea.foundation', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1)
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO settings (setting_key, setting_value) VALUES
('site_name', 'Idea Foundation'),
('contact_email', 'info@idea.foundation'),
('maintenance_mode', '0')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
