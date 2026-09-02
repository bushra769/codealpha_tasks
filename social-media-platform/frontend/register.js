const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            message.textContent = data.message;
            registerForm.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
        } else {
            message.textContent = data.message;
        }

    } catch (error) {
        console.error(error);
        message.textContent = "Cannot connect to server";
    }
});