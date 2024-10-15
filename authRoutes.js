const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("./database"); // Adjust the path if necessary

// Login Route
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Query to find the user by email
    db.query("SELECT * FROM user WHERE email = ?", [email], (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error occurred" });
        }

        // Check if user exists
        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];

        // Compare the entered password with the hashed password in the database
        bcrypt.compare(password, user.Password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: "Error comparing passwords" });
            }

            if (isMatch) {
                // Successful login
                res.json({ success: true, message: "Login successful" });
            } else {
                // Invalid password
                res.status(401).json({ message: "Invalid email or password" });
            }
        });
    });
});

module.exports = router;
