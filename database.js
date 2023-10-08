const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');

  // Create the employees table if it doesn't exist
  const createEmployeesTableQuery = `
    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      job_title VARCHAR(255) NOT NULL,
      phone_number VARCHAR(20),
      email VARCHAR(255),
      address VARCHAR(255),
      city VARCHAR(255),
      state VARCHAR(255)
    )
  `;

  db.query(createEmployeesTableQuery, (err) => {
    if (err) throw err;
    console.log('Employees table created');
  });

  // Create the emergency_contacts table if it doesn't exist
  const createEmergencyContactsTableQuery = `
    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT,
      phone_number VARCHAR(20),
      relationship VARCHAR(255) NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `;

  db.query(createEmergencyContactsTableQuery, (err) => {
    if (err) throw err;
    console.log('Emergency Contacts table created');
  });
});

module.exports = db;
