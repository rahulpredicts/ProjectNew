-- INFINITI CANADA DATABASE - SQL INSERT STATEMENTS
-- Models and Trims for 2025-2026

-- Drop existing tables (optional - uncomment if needed)
-- DROP TABLE IF EXISTS trims;
-- DROP TABLE IF EXISTS models;

-- Create Models Table
CREATE TABLE IF NOT EXISTS models (
  model_id INT PRIMARY KEY,
  model_name VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  type VARCHAR(100) NOT NULL,
  rows INT,
  seats INT NOT NULL,
  engine VARCHAR(100) NOT NULL,
  horsepower INT NOT NULL,
  torque_lbft INT NOT NULL,
  transmission VARCHAR(50),
  drive_type VARCHAR(10),
  country VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Trims Table
CREATE TABLE IF NOT EXISTS trims (
  trim_id INT PRIMARY KEY,
  model_id INT NOT NULL,
  trim_name VARCHAR(50) NOT NULL,
  trim_level VARCHAR(20),
  trim_description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(model_id)
);

-- Insert Models Data
INSERT INTO models (model_id, model_name, year, type, rows, seats, engine, horsepower, torque_lbft, transmission, drive_type, country) VALUES
(1, 'QX80', 2026, 'Full-Size Luxury SUV', 3, 8, '3.5L Twin-Turbo V6', 450, 516, 'Automatic', 'AWD', 'Canada'),
(2, 'QX60', 2026, 'Midsize Luxury SUV', 3, 7, '2.0L Variable Compression Turbo (VC-Turbo)', 268, 286, '9-Speed Automatic', 'AWD', 'Canada'),
(3, 'QX55', 2025, 'Luxury Crossover Coupe', 1, 5, '2.0L Variable Compression Turbo (VC-Turbo)', 268, 286, 'CVT', 'AWD', 'Canada'),
(4, 'QX50', 2025, 'Compact Luxury SUV', 1, 5, '2.0L Variable Compression Turbo (VC-Turbo)', 268, 286, 'CVT', 'AWD', 'Canada');

-- Insert Trims Data
INSERT INTO trims (trim_id, model_id, trim_name, trim_level, trim_description) VALUES
-- QX80 Trims
(101, 1, 'LUXE', 'base', 'Essential QX80 luxury experience'),
(102, 1, 'SPORT', 'mid', 'Bolder appearance with enhanced luxury'),
(103, 1, 'AUTOGRAPH', 'premium', 'Premier trim with massaging seats and quilted leather'),
-- QX60 Trims
(201, 2, 'PURE', 'base', 'Entry-level luxury SUV'),
(202, 2, 'LUXE', 'mid', 'Standard midsize luxury'),
(203, 2, 'LUXE BLACK EDITION', 'mid-special', 'Gloss black wheels and exterior details'),
(204, 2, 'SPORT', 'mid-sport', 'Sporty styling with gloss black accents'),
(205, 2, 'AUTOGRAPH', 'premium', 'Top-tier luxury trim'),
-- QX55 Trims
(301, 3, 'LUXE', 'base', 'Base luxury crossover coupe'),
(302, 3, 'ESSENTIAL', 'mid', 'Mid-range trim with enhanced features'),
(303, 3, 'SENSORY', 'premium', 'Premium crossover coupe trim'),
-- QX50 Trims
(401, 4, 'PURE', 'base', 'Entry-level compact luxury SUV'),
(402, 4, 'LUXE', 'mid', 'Mid-range compact luxury SUV'),
(403, 4, 'SPORT', 'premium', 'Sport-focused compact luxury SUV');

-- Verification Queries
SELECT COUNT(*) as total_models FROM models;
SELECT COUNT(*) as total_trims FROM trims;
SELECT m.model_name, COUNT(t.trim_id) as trim_count FROM models m LEFT JOIN trims t ON m.model_id = t.model_id GROUP BY m.model_id, m.model_name;
