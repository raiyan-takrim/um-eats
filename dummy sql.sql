CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    matric_number TEXT UNIQUE NOT NULL,
    kk_id INT REFERENCES kk(id)
);

CREATE TABLE kk (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    total_meals INT DEFAULT 0
);

CREATE TABLE meal_locations (
    id SERIAL PRIMARY KEY,
    kk_id INT REFERENCES kk(id),
    location_name TEXT NOT NULL
);

CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    kk_id INT REFERENCES kk(id),
    name TEXT NOT NULL,
    quantity INT NOT NULL,
    location_id INT REFERENCES meal_locations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id),
    meal_id INT REFERENCES meals(id),
    kk_id INT REFERENCES kk(id),
    quantity INT NOT NULL CHECK (quantity <= 4),
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE TABLE admins (
--     id SERIAL PRIMARY KEY,
--     name TEXT NOT NULL,
--     email TEXT UNIQUE NOT NULL,
--     password_hash TEXT NOT NULL
-- );
