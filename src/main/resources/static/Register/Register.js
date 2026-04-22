async function register() {

    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        })
    });

    const data = await response.json();

    if (response.ok) {
        alert("Registration Successful ✅");
        window.location.href = "index.html";
    } else {
        alert(data.message);
    }
}