const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt'); // Import bcrypt
const authRoutes = require('./authRoutes'); // Adjust the path if necessary

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json()); // Middleware to parse JSON request bodies
app.use(express.static('public')); // Serve static files
app.use('/api', authRoutes); // Mount auth routes

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your DB user
    password: '123', // Replace with your DB password
    database: 'alumniconnect' // Replace with your database name
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Signup Route
app.post('/api/signup', (req, res) => {
    const { name, email, password, user_type, batch, currentCompany, jobTitle } = req.body;

    // Hash the password before storing it
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ error: 'Error hashing password' });
        }

        // Prepare the insert query for the user table
        const insertUserQuery = `INSERT INTO user (Name, Email, Password, user_type) VALUES (?, ?, ?, ?)`;
        const userValues = [name, email, hashedPassword, user_type];

        db.query(insertUserQuery, userValues, (error, results) => {
            if (error) {
                console.error('Error inserting user:', error);
                return res.status(500).json({ error: 'Database error occurred' });
            }

            const userId = results.insertId; // Get the ID of the inserted user

            // Insert into respective table based on user type
            if (user_type === 'student') {
                const insertStudentQuery = `INSERT INTO student (UserID) VALUES (?)`;
                db.query(insertStudentQuery, [userId], (error) => {
                    if (error) {
                        console.error('Error inserting student:', error);
                        return res.status(500).json({ error: 'Database error occurred' });
                    }
                    res.status(201).json({ message: 'Student registered successfully' });
                });
            } else if (user_type === 'alumni') {
                const insertAlumniQuery = `INSERT INTO alumni (UserID, Batch, CurrentCompany, JobTitle) VALUES (?, ?, ?, ?)`;
                const alumniValues = [userId, batch, currentCompany, jobTitle];

                db.query(insertAlumniQuery, alumniValues, (error) => {
                    if (error) {
                        console.error('Error inserting alumni:', error);
                        return res.status(500).json({ error: 'Database error occurred' });
                    }
                    res.status(201).json({ message: 'Alumni registered successfully' });
                });
            } else {
                return res.status(400).json({ error: 'Invalid user type' }); // Handle invalid user_type
            }
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
