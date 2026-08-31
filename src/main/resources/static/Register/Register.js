async function register() {

    try {

        const response = await fetch(`${BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                password: document.getElementById("password").value
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration Successful ✅");
            window.location.href = "/index.html";
        } else {
            alert(data.message || "Registration failed ❌");
        }

    } catch (error) {

        console.error("Registration error:", error);
        alert("Unable to connect to server ❌");
    }
}