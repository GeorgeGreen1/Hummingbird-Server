-- CREATE TABLE session(
--     id_student INTEGER NOT NULL,
--     id_tutor INTEGER NOT NULL,
--     subject VARCHAR(50),
--     hours INTEGER NOT NULL
-- );



-- CREATE TABLE users(
--     id INTEGER PRIMARY KEY NOT NULL,
--     email VARCHAR(50) UNIQUE NOT NULL,
--     firstname VARCHAR(50) NOT NULL,
--     lastname VARCHAR(50),
--     member_type VARCHAR(7),
--     FOREIGN KEY (id) REFERENCES login (id),
--     FOREIGN KEY (email) REFERENCES login (email)
-- );

-- CREATE TABLE login(
--     id serial PRIMARY KEY,
--     email VARCHAR(50) UNIQUE NOT NULL,
--     pwcrypt VARCHAR(100) NOT NULL
-- );

-- CREATE TABLE users_addtl(
--     id INTEGER PRIMARY KEY NOT NULL,
--     phone VARCHAR(12) NOT NULL,
--     alt_phone VARCHAR(11),
--     birth_date VARCHAR(8) NOT NULL,
--     meet_addr VARCHAR(255) NOT NULL,
--     bill_addr VARCHAR(255),
--     city VARCHAR(50) NOT NULL,
--     state VARCHAR(2) NOT NULL,
--     zip VARCHAR(5) NOT NULL,
--     FOREIGN KEY (id) REFERENCES login (id)
-- );

-- CREATE TABLE notif(
--     notif_id serial PRIMARY KEY,
--     recip_id INTEGER NOT NULL,
--     mesg VARCHAR(100),
--     FOREIGN KEY (recip_id) REFERENCES login (id)
-- );

-- CREATE TABLE study(
--     study_id serial PRIMARY KEY,
--     tutor_id INTEGER NOT NULL,
--     student_id INTEGER NOT NULL,
--     subject INTEGER NOT NULL,
--     course VARCHAR(60),
--     FOREIGN KEY (student_id) REFERENCES login (id),
--     FOREIGN KEY (tutor_id) REFERENCES login (id),
--     FOREIGN KEY (subject) REFERENCES subjects (id)
-- );

-- CREATE TABLE session(
--     session_id serial PRIMARY KEY,
--     date DATE NOT NULL,
--     student_id INTEGER NOT NULL,
--     tutor_id INTEGER NOT NULL,
--     subject VARCHAR(60),
--     course VARCHAR(60),
--     comment VARCHAR(200),
--     hours INTEGER NOT NULL,
--     week_of DATE NOT NULL,
--     verified BOOLEAN NOT NULL   
-- );














-- CREATE TABLE subjects(
--     id serial PRIMARY KEY,
--     name VARCHAR(50)
-- );

-- CREATE TABLE expertise(
--     tutor_id INTEGER NOT NULL,
--     subject VARCHAR(20),
--     level VARCHAR(20),
--     FOREIGN KEY (tutor_id) REFERENCES users (id)
--     PRIMARY KEY (tutor_id,subject)
-- );

-- INSERT INTO subjects (name) VALUES('Literature');

-- DROP TABLE users;
-- DROP TABLE users_addtl;
-- DROP TABLE login;    