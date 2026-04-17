-- Updated 04-17-2026 

-- Users Table
CREATE TABLE IF NOT EXISTS tbl_users (
  "u_id" serial NOT NULL PRIMARY KEY,
  "u_name" text NOT NULL,
  "u_email" varchar(255) NOT NULL UNIQUE,
  "u_type" INTEGER DEFAULT '5' NOT NULL,
  "u_profile" varchar(255) DEFAULT 'defaultpic.jpg' NOT NULL,
  "u_status" text DEFAULT 'active' NOT NULL
);

INSERT INTO tbl_users (u_name, u_email, u_type, u_profile, u_status) VALUES
('system admin', 'matsan00123@gmail.com', '1', 'defaultpic.jpg', 'active'),
('admin', 'toymafiacollectibles@gmail.com', '2', 'defaultpic.jpg', 'active');

-- Items Table

-- CREATE TABLE IF NOT EXISTS tbl_items (
--   item_id          SERIAL PRIMARY KEY,
--   item_name        VARCHAR(50)     NOT NULL,
--   item_description TEXT            NOT NULL,
--   item_location    VARCHAR(50)     NOT NULL,
--   item_category    VARCHAR(50)     NOT NULL,
--   item_quality     VARCHAR(50)     NOT NULL,
--   item_price       NUMERIC(10,2)   NOT NULL DEFAULT 0,
--   item_quantity    INTEGER         NOT NULL DEFAULT 0,
--   item_image       VARCHAR(100)    NOT NULL DEFAULT 'n/a',
--   item_dateAdded   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   item_lastUpdated TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   item_status      VARCHAR(11)     NOT NULL DEFAULT 'active'
-- );

CREATE TABLE IF NOT EXISTS timelogtbl (
  time_id    SERIAL PRIMARY KEY,
  log_action TEXT    NOT NULL,
  log_date   DATE    NOT NULL,
  log_time   TIME    NOT NULL,
  log_status VARCHAR(11) DEFAULT 'active' NOT NULL
);


CREATE TABLE IF NOT EXISTS tbl_items (
item_id SERIAL PRIMARY KEY,
item_name VARCHAR(50) NOT NULL,
item_title VARCHAR(100) NOT NULL,
item_type VARCHAR(50) NOT NULL,
item_description TEXT NOT NULL,
item_location VARCHAR(50) NOT NULL,
item_category VARCHAR(50) NOT NULL,
item_quality VARCHAR(50) NOT NULL,
item_size VARCHAR(50) NOT NULL,
item_sticker VARCHAR(100) NOT NULL,
item_acqprice NUMERIC(10,2) NOT NULL DEFAULT 0,
item_srp NUMERIC(10,2) NOT NULL DEFAULT 0,
item_quantity INTEGER NOT NULL DEFAULT 0,
item_image VARCHAR(100) NOT NULL DEFAULT 'n/a',
item_dateAdded TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
item_lastUpdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
item_status      VARCHAR(11)     NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS tbl_users (
  "u_id" serial NOT NULL PRIMARY KEY,
  "u_name" text NOT NULL,
  "u_email" varchar(255) NOT NULL UNIQUE,
  "u_type" INTEGER DEFAULT '5' NOT NULL,
  "u_profile" varchar(244) DEFAULT 'defaultpic.jpg' NOT NULL,
  "u_status" text DEFAULT 'active' NOT NULL
);

CREATE TABLE IF NOT EXISTS tbl_items (
item_id SERIAL PRIMARY KEY,
item_name VARCHAR(50) NOT NULL,
item_title VARCHAR(100) NOT NULL,
item_type VARCHAR(50) NOT NULL,
item_description TEXT NOT NULL,
item_location VARCHAR(50) NOT NULL,
item_category VARCHAR(50) NOT NULL,
item_quality VARCHAR(50) NOT NULL,
item_size VARCHAR(50) NOT NULL,
item_sticker VARCHAR(100) NOT NULL,
item_acqprice NUMERIC(10,2) NOT NULL DEFAULT 0,
item_srp NUMERIC(10,2) NOT NULL DEFAULT 0,
item_quantity INTEGER NOT NULL DEFAULT 0,
item_image VARCHAR(100) NOT NULL DEFAULT 'n/a',
item_dateAdded TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
item_lastUpdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
item_status      VARCHAR(11)     NOT NULL DEFAULT 'active'
);