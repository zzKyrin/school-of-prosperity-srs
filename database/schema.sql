-- School of Prosperity SRS - database design (data tier from the Phase 8 deployment diagram)
-- NOT connected to the web prototype. The prototype stores data in the browser instead.
-- Written to run on SQLite for testing; works with small changes in MySQL / PostgreSQL.

CREATE TABLE user_account (
    user_id        TEXT PRIMARY KEY,              -- Student ID or Staff ID (login name)
    role           TEXT NOT NULL CHECK (role IN ('student', 'staff')),
    password_hash  TEXT NOT NULL                  -- never store plain passwords
);

CREATE TABLE student (                            -- UC-01 Student Search / Student Record
    student_id  TEXT PRIMARY KEY REFERENCES user_account(user_id),
    name        TEXT NOT NULL,
    program     TEXT NOT NULL,
    level       TEXT NOT NULL CHECK (level IN ('Undergraduate', 'Graduate')),
    status      TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Graduated'))
);

CREATE TABLE course (                             -- UC-02 Course List / Course Record
    course_code    TEXT PRIMARY KEY,              -- e.g. INSY 4307
    title          TEXT NOT NULL,
    credits        INTEGER NOT NULL CHECK (credits BETWEEN 1 AND 6),
    prerequisite   TEXT REFERENCES course(course_code)
);

CREATE TABLE class (                              -- UC-03 Class List / Class Record
    class_id    INTEGER PRIMARY KEY,
    course_code TEXT NOT NULL REFERENCES course(course_code),
    term        TEXT NOT NULL,                    -- e.g. Spring 2027
    modality    TEXT NOT NULL CHECK (modality IN ('Online', 'Face-to-Face')),
    days        TEXT,                             -- e.g. 'MW' ; NULL for asynchronous
    start_time  TEXT,
    end_time    TEXT,
    instructor  TEXT NOT NULL,
    capacity    INTEGER NOT NULL CHECK (capacity >= 0),
    UNIQUE (course_code, term, days, start_time)
);

CREATE TABLE registration (                       -- UC-04 register, UC-05 drop, UC-07 schedule, FR-3 grades
    student_id     TEXT    NOT NULL REFERENCES student(student_id),
    class_id       INTEGER NOT NULL REFERENCES class(class_id),
    status         TEXT    NOT NULL DEFAULT 'Registered' CHECK (status IN ('Registered', 'Dropped')),
    registered_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    grade          TEXT    CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),   -- NULL until staff post it
    PRIMARY KEY (student_id, class_id)            -- blocks duplicate registration
);

-- Seats left in a class (used to deny registration when full, TC-010)
-- SELECT c.capacity - COUNT(r.student_id) AS seats_left
-- FROM class c LEFT JOIN registration r ON r.class_id = c.class_id AND r.status = 'Registered'
-- WHERE c.class_id = ? GROUP BY c.class_id;

-- GPA for one student (A=4, B=3, C=2, D=1, F=0)
-- SELECT SUM(CASE r.grade WHEN 'A' THEN 4 WHEN 'B' THEN 3 WHEN 'C' THEN 2 WHEN 'D' THEN 1 ELSE 0 END * co.credits) * 1.0 / SUM(co.credits)
-- FROM registration r JOIN class c ON c.class_id = r.class_id JOIN course co ON co.course_code = c.course_code
-- WHERE r.student_id = ? AND r.grade IS NOT NULL AND r.status = 'Registered';
