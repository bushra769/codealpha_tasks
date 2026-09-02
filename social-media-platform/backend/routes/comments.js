const express = require("express");
const router = express.Router();

const db = require("../database");

// Add a comment
router.post("/posts/:postId/comments", (req, res) => {
    const { postId } = req.params;
    const { user_id, comment } = req.body;

    if (!user_id || !comment) {
        return res.status(400).json({
            message: "User ID and comment are required"
        });
    }

    const sql = `
        INSERT INTO comments (post_id, user_id, comment)
        VALUES (?, ?, ?)
    `;

    db.run(sql, [postId, user_id, comment], function (err) {
        if (err) {
            return res.status(500).json({
                message: "Failed to add comment"
            });
        }

        res.status(201).json({
            message: "Comment added successfully",
            commentId: this.lastID
        });
    });
});

// Get comments for a post
router.get("/posts/:postId/comments", (req, res) => {
    const { postId } = req.params;

    const sql = `
        SELECT 
            comments.id,
            comments.comment,
            comments.created_at,
            users.name
        FROM comments
        JOIN users ON comments.user_id = users.id
        WHERE comments.post_id = ?
        ORDER BY comments.created_at ASC
    `;

    db.all(sql, [postId], (err, comments) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to get comments"
            });
        }

        res.json(comments);
    });
});

module.exports = router;