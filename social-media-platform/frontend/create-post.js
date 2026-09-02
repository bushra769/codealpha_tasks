const postForm = document.getElementById("postForm");
const postMessage = document.getElementById("postMessage");

postForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const content = document.getElementById("postContent").value.trim();

    if (!content) {
        postMessage.textContent = "Please write something.";
        return;
    }

    const userData = localStorage.getItem("user");

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);

    try {
        const response = await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user.id,
                content: content
            })
        });

        const data = await response.json();

        if (response.ok) {
            postMessage.textContent = "Post created successfully!";
            document.getElementById("postContent").value = "";

            setTimeout(() => {
                window.location.href = "profile.html";
            }, 1000);
        } else {
            postMessage.textContent = data.message;
        }

    } catch (error) {
        console.error(error);
        postMessage.textContent = "Cannot connect to server";
    }
});