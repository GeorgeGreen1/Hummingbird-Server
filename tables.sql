-- CREATE TABLE session(
--     id_student INTEGER NOT NULL,
--     id_tutor INTEGER NOT NULL,
--     subject VARCHAR(50),
--     hours INTEGER NOT NULL
-- );

CREATE TABLE users_addtl(
    id INTEGER PRIMARY KEY NOT NULL,
    phone VARCHAR(12) NOT NULL,
    alt_phone VARCHAR(11),
    birth_date VARCHAR(8) NOT NULL,
    street_addr VARCHAR(255) NOT NULL,
    alt_street_addr VARCHAR(255),
    city VARCHAR(50) NOT NULL,
    alt_city VARCHAR(50),
    state VARCHAR(2) NOT NULL,
    alt_state VARCHAR(2),
    zip VARCHAR(5) NOT NULL,
    alt_zip VARCHAR(5)
);
