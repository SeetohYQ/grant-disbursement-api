CREATE SCHEMA IF NOT EXISTS my_db;
USE my_db;

DROP TABLE IF EXISTS Person;
DROP TABLE IF EXISTS Household;

CREATE TABLE IF NOT EXISTS Household (
    ID VARCHAR(64) NOT NULL,
    HOUSING_TYPE ENUM('Landed', 'Condominium', 'HDB') NOT NULL,
    FLOOR_NUMBER VARCHAR(4) NOT NULL, 
    UNIT_NUMBER VARCHAR(8) NOT NULL,
    POSTAL_CODE VARCHAR(8) NOT NULL,

    PRIMARY KEY(ID, FLOOR_NUMBER, UNIT_NUMBER, POSTAL_CODE)
);

CREATE TABLE IF NOT EXISTS Person (
    ID VARCHAR(16) NOT NULL,
    NAME VARCHAR(128) NOT NULL,
    GENDER ENUM('Male', 'Female') NOT NULL,
    MARITAL_STATUS ENUM('Single', 'Married', 'Widowed', 'Separated', 'Divorced') NOT NULL,
    SPOUSE VARCHAR(16), 
    OCCUPTATION_TYPE ENUM('Employed', 'Unemployed', 'Student') NOT NULL,
    ANNUAL_INCOME INT,
    DOB DATE NOT NULL,
    HOUSING_ID VARCHAR(64) NOT NULL,

    PRIMARY KEY(ID), 
    FOREIGN KEY (HOUSING_ID) REFERENCES Household(ID) ON DELETE CASCADE
);

INSERT INTO Household (ID, HOUSING_TYPE, FLOOR_NUMBER, UNIT_NUMBER, POSTAL_CODE) VALUES 
("423712334", "HDB", 4, 23, 712334),
("08712666", "Landed", 0, 8, 712666),
("15108632123", "HDB", 15, 108, 632123);

INSERT INTO Person VALUES 
("S8251234X", "John Doe", "Male", "Married", "S8451234X", "Employed", "80000", "1982-04-23", "423712334"),
("S8451234F", "Jane Tan", "Female", "Married", "S8251234X", "Employed", "50000", "1984-08-23", "423712334"),
("S9941234A", "John JR", "Male", "Single", null, "Student", 0, "2010-01-13", "423712334"),
("S7251234X", "Peter Foo", "Male", "Married", "S7451234X", "Employed", "100000", "1972-01-23", "08712666"),
("S7451234X", "Jane Tan", "Female", "Married", "S7251234X", "Employed", "100000", "1974-02-13", "08712666"),
("S0041234A", "Jenny Foo", "Female", "Single", null, "Student", 0, "2004-01-13", "08712666"),
("S1234567X", "Retiree", "Female", "Widowed", null, "Unemployed", 0, "1962-01-13", "15108632123"),
("S2256788X", "Retiree's child", "Male", "Single", null, "Student", 0, "2004-08-13", "15108632123")