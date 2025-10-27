
# log in to MySQL;
```sql
mysql -u root -p
```
# create database and tables:
```sql
CREATE DATABASE quiz_app;
USE quiz_app;

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL
);

CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    score INT,
    total INT
);
```
# insert some sample questions and answers;
```sql
INSERT INTO questions (question, answer) VALUES
('What does CPU stand for?', 'central processing unit'),
('What does GPU stand for?', 'graphics processing unit'),
('What does RAM stand for?', 'random access memory'),
('What does PSU stand for?', 'power supply unit'),
('What is the full form of USB?', 'universal serial bus');
```
