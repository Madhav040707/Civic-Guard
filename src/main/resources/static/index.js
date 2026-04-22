async function login() {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        })
    });

    const data = await response.json();
    console.log("LOGIN RESPONSE:", data);

    if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data));

        if (data.role === "ADMIN") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "main.html";
        }

    } else {
        alert(data.message);
    }
}

// ✅ AUTO REDIRECT IF ALREADY LOGGED IN
window.onload = function () {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        if (user.role === "ADMIN") {
            window.location.replace("admin.html");
        } else {
            window.location.replace("main.html");
        }
    }
};
