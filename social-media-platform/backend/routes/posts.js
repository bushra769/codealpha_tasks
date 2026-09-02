const express = require("express");
const router = express.Router();

const db = require("../database");

// Create a post
router.post("/posts", (req, res) => {
    const { user_id, content } = req.body;

    if (!user_id || !content) {
        return res.status(400).json({
            message: "User ID and post content are required"
        });
    }

    const sql = `
        INSERT INTO posts (user_id, content)
        VALUES (?, ?)
    `;

    db.run(sql, [user_id, content], function (err) {
        if (err) {
            return res.status(500).json({
                message: "Failed to create post"
            });
        }

        res.status(201).json({
            message: "Post created successfully",
            postId: this.lastID
        });
    });
});

// Get all posts
router.get("/posts", (req, res) => {
    const sql = `
        SELECT 
            posts.id,
            posts.user_id,
            posts.content,
            posts.created_at,
            users.name
        FROM posts
        JOIN users ON posts.user_id = users.id
        ORDER BY posts.created_at DESC
    `;

    db.all(sql, [], (err, posts) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to get posts"
            });
        }

        res.json(posts);
    });
});

module.exports = router;
// Like a post
router.post("/posts/:postId/like", (req, res) => {
    const { postId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({
            message: "User ID is required"
        });
    }

    const checkSql = `
        SELECT * FROM likes
        WHERE post_id = ? AND user_id = ?
    `;

    db.get(checkSql, [postId, user_id], (err, like) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to check like"
            });
        }

        if (like) {
            return res.status(400).json({
                message: "You already liked this post"
            });
        }

        const sql = `
            INSERT INTO likes (post_id, user_id)
            VALUES (?, ?)
        `;

        db.run(sql, [postId, user_id], function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Failed to like post"
                });
            }

            res.json({
                message: "Post liked successfully"
            });
        });
    });
});