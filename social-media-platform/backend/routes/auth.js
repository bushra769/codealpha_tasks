const express = require("express");
const router = express.Router();

const db = require("../database");

// Register user
router.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.run(sql, [name, email, password], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.status(400).json({
                    message: "Email already exists"
                });
            }

            return res.status(500).json({
                message: "Registration failed"
            });
        }

        res.status(201).json({
            message: "Registration successful",
            userId: this.lastID
        });
    });
});

module.exports = router;
// Login user
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql = `
        SELECT id, name, email, bio, profile_image
        FROM users
        WHERE email = ? AND password = ?
    `;

    db.get(sql, [email, password], (err, user) => {
        if (err) {
            return res.status(500).json({
                message: "Login failed"
            });
        }

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful",
            user
        });
    });
});