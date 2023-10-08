const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const employeeController = require('./employeeController/employeeController');
const db = require('./database');
const fs = require('fs');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.post('/employees', (req, res) => {
    employeeController.createEmployee(req.body, (response) => {
        res.status(201).json(response);
    });
});

app.get('/employees', (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    employeeController.listEmployees(page, limit, (results) => {
        res.json(results);
    });
});

app.put('/employees/:id', (req, res) => {
    const employeeId = req.params.id;
    employeeController.updateEmployee(employeeId, req.body, (response) => {
        res.json(response);
    });
});

app.delete('/employees/:id', (req, res) => {
    const employeeId = req.params.id;
    employeeController.deleteEmployee(employeeId, (response) => {
        res.json(response);
    });
});

app.get('/employees/:id', (req, res) => {
    const employeeId = req.params.id;
    employeeController.getEmployee(employeeId, (employee) => {
        res.json(employee);
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
