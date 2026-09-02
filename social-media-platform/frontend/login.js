const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("user", JSON.stringify(data.user));

            message.textContent = "Login successful!";

            setTimeout(() => {
                window.location.href = "profile.html";
            }, 1000);

        } else {
            message.textContent = data.message;
        }

    } catch (error) {
        console.error(error);
        message.textContent = "Cannot connect to server";
    }
});