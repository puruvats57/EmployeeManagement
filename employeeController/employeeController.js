const mysql = require('mysql');
const db = require('../database');

// Create an employee with multiple contact details
function createEmployee(employeeData, callback) {
    const {
        full_name,
        job_title,
        phone_number,
        email,
        address,
        city,
        state,
        emergency_contacts,
    } = employeeData;
    console.log("emergency_contacts", emergency_contacts);
    const insertEmployeeQuery = `
        INSERT INTO employees (full_name, job_title, phone_number, email, address, city, state)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const employeeValues = [
        full_name,
        job_title,
        phone_number,
        email,
        address,
        city,
        state,
    ];

    db.query(insertEmployeeQuery, employeeValues, (error, result) => {
        if (error) {
            console.error('Error creating employee:', error);
            callback({ error: 'Error creating employee' });
        } else {
            const employeeId = result.insertId;

            // Insert emergency contact details
            const insertEmergencyContactsQuery = `
                INSERT INTO emergency_contacts (employee_id, phone_number, relationship)
                VALUES (?, ?, ?)
            `;

            // Loop through each emergency contact and insert it individually
            const insertPromises = emergency_contacts.map(contact => {
                const contactValues = [employeeId, contact.phone_number, contact.relationship];
                return new Promise((resolve, reject) => {
                    db.query(insertEmergencyContactsQuery, contactValues, (err) => {
                        if (err) {
                            console.error('Error inserting emergency contact:', err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });

            // Wait for all inserts to complete
            Promise.all(insertPromises)
                .then(() => {
                    console.log('Employee created successfully with ID:', employeeId);
                    callback({ message: 'Employee created successfully', employeeId });
                })
                .catch((err) => {
                    console.error('Error creating emergency contacts:', err);
                    callback({ error: 'Error creating emergency contacts' });
                });
        }
    });
}



// List employees with pagination
function listEmployees(page, limit, callback) {
    const offset = (page - 1) * limit;
    const sql = `
        SELECT e.*, ec.phone_number AS contact_phone, ec.relationship AS contact_relationship
        FROM employees e
        LEFT JOIN emergency_contacts ec ON e.id = ec.employee_id
        LIMIT ? OFFSET ?
    `;
    const values = [parseInt(limit), offset];

    db.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error listing employees:', error);
            callback({ error: 'Error listing employees' });
        } else {
            // Create a map to organize employees by ID and store emergency contacts
            const employeeMap = new Map();

            results.forEach(row => {
                const {
                    id,
                    full_name,
                    job_title,
                    phone_number,
                    email,
                    address,
                    city,
                    state,
                    contact_phone,
                    contact_relationship
                } = row;

                if (!employeeMap.has(id)) {
                    // Initialize the employee object with basic information and an empty emergency_contacts array
                    employeeMap.set(id, {
                        id,
                        full_name,
                        job_title,
                        phone_number,
                        email,
                        address,
                        city,
                        state,
                        emergency_contacts: []
                    });
                }

                // Check if contact_phone and contact_relationship are not null, then add them to emergency_contacts
                if (contact_phone && contact_relationship) {
                    employeeMap.get(id).emergency_contacts.push({
                        phone_number: contact_phone,
                        relationship: contact_relationship
                    });
                }
            });

            // Convert the map to an array of employees
            const employeeArray = Array.from(employeeMap.values());

            callback(employeeArray);
        }
    });
}



// Update an employee by ID
function updateEmployee(employeeId, employeeData, callback) {
    const { full_name } = employeeData;
    const sql = 'UPDATE employees SET full_name=? WHERE id=?';
    const values = [full_name, employeeId];

    db.query(sql, values, (error, result) => {
        if (error) {
            console.error('Error updating employee:', error);
            callback({ error: 'Error updating employee' });
        } else {
            callback({ message: 'Employee updated successfully' });
        }
    });
}


// Delete an employee by ID
function deleteEmployee(employeeId, callback) {
    const sql = 'DELETE FROM employees WHERE id=?';
    const values = [employeeId];

    db.query(sql, values, (error, result) => {
        if (error) {
            console.error('Error deleting employee:', error);
            callback({ error: 'Error deleting employee' });
        } else {
            callback({ message: 'Employee deleted successfully' });
        }
    });
}

// Get an employee by ID
function getEmployee(employeeId, callback) {
    const sql = 'SELECT * FROM employees WHERE id=?';
    const values = [employeeId];

    db.query(sql, values, (error, result) => {
        if (error) {
            console.error('Error fetching employee:', error);
            callback({ error: 'Error fetching employee' });
        } else {
            if (result.length === 0) {
                callback({ error: 'Employee not found' });
            } else {
                callback(result[0]);
            }
        }
    });
}

module.exports = {
    createEmployee,
    listEmployees,
    updateEmployee,
    deleteEmployee,
    getEmployee,
};
