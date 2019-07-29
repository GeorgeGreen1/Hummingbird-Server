-- CREATE TABLE session(
--     id_student INTEGER NOT NULL,
--     id_tutor INTEGER NOT NULL,
--     subject VARCHAR(50),
--     hours INTEGER NOT NULL
-- );

-- CREATE TABLE tutor_bg(
--     tutor_id INTEGER NOT NULL,
--     edu_earned INTEGER NOT NULL,
--     years_exp INTEGER NOT NULL,
--     description VARCHAR(400) NOT NULL,
--     FOREIGN KEY (tutor_id) REFERENCES login (id)
-- );

CREATE TABLE student_hours(
    user_id INTEGER PRIMARY KEY NOT NULL,
    hours_remaining INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES login (id)
);


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

--  14 | 777-777-8888 |           | 19961009   | The Gym                | 3010 Ab Photo Rd       | Los Abgeles | CA    | 10010
--  15 | 952-443-4137 |           | 19960417   | 6344 Wilryan Avenue    | Billy Avenue           | Edina       | MN    | 55436
-- (11 rows)

-- INSERT INTO users_addtl (id,phone,birth_date, meet_addr, bill_addr,city, state,zip) 
--             VALUES(2,'123-555-5555','1970-01-01','Monster Jam University','1001 Grave Digger Road','Toledo','OH','12010'); 
-- INSERT INTO users_addtl (id,phone,birth_date, meet_addr, bill_addr,city, state,zip) 
--             VALUES(3,'139-294-0194','1968-02-02','Team Scream House','3010 YEAAAAAAH Street','Columbus','MI','95021'); 
-- INSERT INTO users_addtl (id,phone,birth_date, meet_addr, bill_addr,city, state,zip) 
--             VALUES(4,'104-494-4441','1982-08-19','Zombie Graveyard','0491 Ohh Bari Blv','Orlando','FL','29554'); 
-- INSERT INTO users_addtl (id,phone,birth_date, meet_addr, bill_addr,city, state,zip) 
--             VALUES(5,'999-999-9999','1984-03-12','Monster Energy HQ','909 Indies Suck Rd','Phoenix','AZ','99014'); 
-- INSERT INTO users_addtl (id,phone,birth_date, meet_addr, bill_addr,city, state,zip) 
--             VALUES(6,'303-404-1001','1997-10-12','Somewhere in Iowa','1010 Blue Thunder Ave','Oscaloosa','IA','10301'); 
-- INSERT INTO users_addtl (id,phone,birth_date, meet_addr, bill_addr,city, state,zip) 
--             VALUES(7,'333-333-3333','1990-02-14','Le Quebec Shop','333 Queix Vouis Rd','Montreal','CA','11111'); 
-- INSERT INTO users_addtl (id,phone,birth_date, meet_addr, bill_addr,city, state,zip) 
--             VALUES(12,'100-100-1000','1989-05-04','Alien UFO','5555 UFO Rd','Corn Field','NE','34852'); 

-- INSERT INTO users_addtl (id,phone,birth_date, meet_addr, bill_addr,city, state,zip) 
--             VALUES(1,'123-555-5555','1987-01-01','Monster Jam University','1 Goldberg Ave','Paxton','IL','11010'); 
-- CREATE TABLE users_addtl(
--     id INTEGER PRIMARY KEY NOT NULL,
--     phone VARCHAR(12) NOT NULL,
--     alt_phone VARCHAR(11),
--     birth_date DATE NOT NULL,
--     meet_addr VARCHAR(255) NOT NULL,
--     bill_addr VARCHAR(255),
--     city VARCHAR(50) NOT NULL,
--     state VARCHAR(2) NOT NULL,
--     zip VARCHAR(5) NOT NULL,
--     FOREIGN KEY (id) REFERENCES login (id)
-- );

-- CREATE TABLE notif(
--     recip_id INTEGER NOT NULL,
--     mesg VARCHAR(100),
--     time TIMESTAMP NOT NULL,
--     FOREIGN KEY (recip_id) REFERENCES login (id)
-- );


-- CREATE TABLE match(
--     tutor_id INTEGER NOT NULL,
--     student_id INTEGER NOT NULL,
--     FOREIGN KEY (student_id) REFERENCES login (id),
--     FOREIGN KEY (tutor_id) REFERENCES login (id)
-- );


-- CREATE TABLE study(ff
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
--     date DATE NOT NULL,
--     start_time VARCHAR(5) NOT NULL,
--     end_time VARCHAR(5) NOT NULL,
--     tutor_id INTEGER NOT NULL,
--     student_id INTEGER NOT NULL,
--     subject VARCHAR(60),
--     PRIMARY KEY (tutor_id,student_id,date,start_time)
-- );


-- CREATE TABLE log_connection(
--     tutor_id INTEGER NOT NULL,
--     student_id INTEGER NOT NULL,    
--     log_date DATE NOT NULL
--     PRIMARY KEY (tutor_id,student_id)
-- )


-- CREATE TABLE tutor_square(
--     tutor_id INTEGER NOT NULL,
--     employee_id VARCHAR(20)
-- );


-- CREATE TABLE subjects(
--     id serial PRIMARY KEY,
--     name VARCHAR(50)
-- );

-- CREATE TABLE user_settings(
--     user_id INTEGER PRIMARY KEY,
--     notify_match BOOLEAN,
--     display_email BOOLEAN,
--     FOREIGN KEY (user_id) REFERENCES users (id)
-- );


-- CREATE TABLE tutor_settings(
--     user_id INTEGER PRIMARY KEY,
--     match_available BOOLEAN,
--     FOREIGN KEY (user_id) REFERENCES users (id)
-- );


-- CREATE TABLE student_settings(
--     user_id INTEGER PRIMARY KEY,
    
--     FOREIGN KEY (user_id) REFERENCES users (id)
-- );

-- CREATE TABLE nflteams(
--     name VARCHAR(50),
--     abbrev VARCHAR(3),
--     division VARCHAR(4),
--     head_coach VARCHAR(50),
--     location VARCHAR(50),
--     stadium VARCHAR(50)
-- );
-- CREATE TABLE job_postings(
--     request_id serial PRIMARY KEY,
--     user_id INTEGER NOT NULL,
--     stud_name VARCHAR(40),
--     school VARCHAR(40),
--     course VARCHAR(40),
--     subject VARCHAR(20),
--     level VARCHAR(20),
--     comments VARCHAR(300),
--     date DATE NOT NULL,
--     FOREIGN KEY (user_id) REFERENCES users (id)
-- );

-- CREATE TABLE tutor_description (
--     tutor_id INTEGER NOT NULL,
--     description VARCHAR(400) NOT NULL,
--     FOREIGN KEY (tutor_id) REFERENCES users (id)
-- );

-- CREATE TABLE expertise(
--     tutor_id INTEGER NOT NULL,
--     subject VARCHAR(20),
--     level INTEGER NOT NULL,
--     FOREIGN KEY (tutor_id) REFERENCES users (id),
--     PRIMARY KEY (tutor_id,subject)
-- );

-- INSERT INTO tutor_square (tutor_id,employee_id) VALUES(16,'gHnTnJJjhiKrw6MYZlMK');
-- INSERT INTO user_settings (user_id,notify_match,display_email) VALUES(5,false,false);
-- INSERT INTO tutor_settings (user_id,match_available) VALUES(5,false);


-- DROP TABLE users;
-- DROP TABLE users_addtl;
-- DROP TABLE login;    