-- Run this SQL in your Neon dashboard to create the table

CREATE TABLE IF NOT EXISTS tbl_items (
  item_id       SERIAL PRIMARY KEY,
  item_name        VARCHAR(255) NOT NULL,
  item_description TEXT,
  item_location    VARCHAR(255),
  item_category    VARCHAR(255),
  item_quality     VARCHAR(100),
  item_price       NUMERIC(10, 2) DEFAULT 0,
  item_quantity    INTEGER DEFAULT 0,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- Optional: seed some sample data
INSERT INTO tbl_items (item_name, item_description, item_location, item_category, item_quality, item_price, item_quantity)
VALUES
  ('Action Figure A', 'Limited edition collectible', 'Shelf 1', 'Collectibles', 'Mint', 1500.00, 10),
  ('Toy Car B', 'Die-cast metal toy car', 'Shelf 2', 'Vehicles', 'Excellent', 350.00, 25),
  ('Board Game C', 'Strategy board game', 'Cabinet 1', 'Games', 'Good', 800.00, 5);
