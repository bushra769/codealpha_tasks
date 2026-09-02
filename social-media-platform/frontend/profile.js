const userData = localStorage.getItem("user");

if (!userData) {
    window.location.href = "login.html";
} else {
    const user = JSON.parse(userData);

    document.getElementById("profileName").textContent = user.name;
    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("profileBio").textContent =
        user.bio || "No bio added yet.";

    loadMyPosts(user.id);
}


// Load user's posts
async function loadMyPosts(userId) {
    const myPosts = document.getElementById("myPosts");

    try {
        const response = await fetch("/api/posts");
        const posts = await response.json();

        const userPosts = posts.filter(post => post.user_id == userId);

        if (userPosts.length === 0) {
            myPosts.innerHTML = "<p>No posts yet.</p>";
            return;
        }

        myPosts.innerHTML = "";

        userPosts.forEach(post => {
    const postElement = document.createElement("div");

    postElement.className = "post";

    postElement.innerHTML = `
        <p>${post.content}</p>
        <small>${post.created_at}</small>
        <button onclick="likePost(${post.id})">
    ❤️ Like
</button>

<p id="likeMessage-${post.id}"></p>

        <div class="comments-section">
            <h4>Comments</h4>

            <div id="comments-${post.id}">
                Loading comments...
            </div>

            <input
                type="text"
                id="commentInput-${post.id}"
                placeholder="Write a comment..."
            >

            <button onclick="addComment(${post.id})">
                Comment
            </button>

            <p id="commentMessage-${post.id}"></p>
        </div>
    `;

    myPosts.appendChild(postElement);

    loadComments(post.id);
});

    } catch (error) {
        console.error(error);
        myPosts.innerHTML = "<p>Failed to load posts.</p>";
    }
}


// Logout
document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
});
async function loadComments(postId) {
    const commentsContainer = document.getElementById(`comments-${postId}`);

    try {
        const response = await fetch(`/api/posts/${postId}/comments`);
        const comments = await response.json();

        if (comments.length === 0) {
            commentsContainer.innerHTML = "<p>No comments yet.</p>";
            return;
        }

        commentsContainer.innerHTML = "";

        comments.forEach(comment => {
            const commentElement = document.createElement("p");

            commentElement.innerHTML = `
                <strong>${comment.name}</strong>: ${comment.comment}
            `;

            commentsContainer.appendChild(commentElement);
        });

    } catch (error) {
        console.error(error);
        commentsContainer.textContent = "Failed to load comments.";
    }
}

async function addComment(postId) {
    const userData = localStorage.getItem("user");

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);

    const input = document.getElementById(`commentInput-${postId}`);
    const message = document.getElementById(`commentMessage-${postId}`);

    const comment = input.value.trim();

    if (!comment) {
        message.textContent = "Please write a comment.";
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user.id,
                comment: comment
            })
        });

        const data = await response.json();

        if (response.ok) {
            input.value = "";
            message.textContent = "Comment added successfully!";
            loadComments(postId);
        } else {
            message.textContent = data.message;
        }

    } catch (error) {
        console.error(error);
        message.textContent = "Cannot connect to server.";
    }
}
async function likePost(postId) {
    const userData = localStorage.getItem("user");

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);

    try {
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user.id
            })
        });

        const data = await response.json();

        document.getElementById(`likeMessage-${postId}`).textContent =
            data.message;

    } catch (error) {
        console.error(error);
    }
}
async function followUser(userId) {
    const userData = localStorage.getItem("user");

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);

    try {
        const response = await fetch(`/api/users/${userId}/follow`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                follower_id: user.id
            })
        });

        const data = await response.json();

        document.getElementById("followMessage").textContent =
            data.message;

    } catch (error) {
        console.error(error);
        document.getElementById("followMessage").textContent =
            "Cannot connect to server";
    }
}