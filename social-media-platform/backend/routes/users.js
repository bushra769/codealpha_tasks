const express = require("express");
const router = express.Router();

const db = require("../database");

// Follow a user
router.post("/users/:userId/follow", (req, res) => {
    const { userId } = req.params;
    const { follower_id } = req.body;

    if (!follower_id) {
        return res.status(400).json({
            message: "Follower ID is required"
        });
    }

    if (Number(userId) === Number(follower_id)) {
        return res.status(400).json({
            message: "You cannot follow yourself"
        });
    }

    const checkSql = `
        SELECT * FROM followers
        WHERE follower_id = ? AND following_id = ?
    `;

    db.get(checkSql, [follower_id, userId], (err, follow) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to check follow"
            });
        }

        if (follow) {
            return res.status(400).json({
                message: "You already follow this user"
            });
        }

        const sql = `
            INSERT INTO followers (follower_id, following_id)
            VALUES (?, ?)
        `;

        db.run(sql, [follower_id, userId], function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Failed to follow user"
                });
            }

            res.json({
                message: "User followed successfully"
            });
        });
    });
});

module.exports = router;