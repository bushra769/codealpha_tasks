const userData = localStorage.getItem("user");

if (!userData) {
    window.location.href = "login.html";
} else {
    const user = JSON.parse(userData);

    document.getElementById("userName").textContent = user.name;

    loadPosts();
}

async function loadPosts() {
    const postsContainer = document.getElementById("postsContainer");

    try {
        const response = await fetch("/api/posts");
        const posts = await response.json();

        if (posts.length === 0) {
            postsContainer.innerHTML = "<p>No posts yet.</p>";
            return;
        }

        postsContainer.innerHTML = "";

        posts.forEach(post => {
            const postElement = document.createElement("div");

            postElement.className = "post";

            postElement.innerHTML = `
                <h3>${post.name}</h3>
                <p>${post.content}</p>
                <small>${post.created_at}</small>
            `;

            postsContainer.appendChild(postElement);
        });

    } catch (error) {
        console.error(error);
        postsContainer.innerHTML = "<p>Failed to load posts.</p>";
    }
}