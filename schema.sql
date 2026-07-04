
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    volunteer_type VARCHAR(50),
    contribution TEXT,
    resume BYTEA,
    github TEXT,
    linkedin TEXT,
    portfolio TEXT,
    submitted_at TIMESTAMP DEFAULT NOW()
);