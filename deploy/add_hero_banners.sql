CREATE TABLE IF NOT EXISTS hero_banners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NULL,
    subtitle TEXT NULL,
    image VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hero_banner_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
