CREATE DATABASE childcarereviews;

CREATE TABLE childcare (
    id SERIAL PRIMARY KEY,
    name TEXT,
    location TEXT,
    zipcode INTEGER,
    image_url TEXT,
    number_of_meals INTEGER, 
    provide_nappies TEXT,
    opening_hours TEXT,
    daily_fees INTEGER,
    user_id INTEGER,
    review TEXT
);


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    password_digest TEXT 
);


INSERT INTO childcare (name, location, zipcode, image_url, number_of_meals, provide_nappies, opening_hours, daily_fees, review) VALUES ('orchard', 'kirrawee', '2232', 'https://www.shutterstock.com/image-photo/child-disabled-childcare-260nw-766263424.jpg', '5', 'yes', 'from 6:30am to 6:30pm', '157', 'my kids love it');

INSERT INTO childcare (name, location, zipcode, image_url, number_of_meals, provide_nappies, opening_hours, daily_fees, review) VALUES ('ABC', 'miranda', '2232', 'https://www.treasury.nsw.gov.au/sites/default/files/styles/slideshow/public/0322-03_affordable-childcare-02_2000x430_0.png?h=9c3c3482&itok=bcPstUCq', '3', 'no', 'from 8am to 5pm', '130', 'my kids hated it');