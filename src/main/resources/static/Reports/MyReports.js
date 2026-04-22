window.onload = function () {
    checkAuth();
    fetchMyReports();
};

// ================= AUTH =================
function checkAuth() {
    const user = localStorage.getItem("user");
    if (!user) window.location.href = "index.html";
}

// ================= FETCH USER REPORTS =================
function fetchMyReports() {
    const user = JSON.parse(localStorage.getItem("user"));

    fetch(`http://localhost:8080/api/complaints/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
            showReports(data);
            updateStats(data);
        })
        .catch(err => {
            console.error(err);
            alert("Error loading reports ❌");
        });
}

// ================= SHOW REPORTS =================
function showReports(data) {
    const container = document.querySelector(".complaints");
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = `<div class="no-data">No reports found 🚫</div>`;
        return;
    }

    data.forEach(c => {
        const card = document.createElement("div");
        card.className = "complaint-card";

        if (c.imagePath) {
            const img = document.createElement("img");
            img.src = "http://localhost:8080" + c.imagePath;
            img.className = "complaint-img";
            card.appendChild(img);
        }

        const body = document.createElement("div");
        body.className = "card-body";

        const statusClass =
            c.status === "PENDING" ? "status-pending" :
                c.status === "IN_PROGRESS" ? "status-progress" :
                    "status-resolved";

        body.innerHTML = `
    <div class="status-badge ${statusClass}">${c.status}</div>
    <div class="complaint-title">${c.category || "No Category"}</div>
    <div class="location">📍 ${c.location || "Unknown"}</div>
    <div class="description">${c.description || "No Description"}</div>
    <div class="complaint-date">${formatDate(c.createdAt)}</div>
`;

        card.appendChild(body);
        container.appendChild(card);
    });
}

// ================= STATS =================
function updateStats(data) {
    document.getElementById("total").innerText = data.length;

    let pending = 0, progress = 0, resolved = 0;

    data.forEach(c => {
        if (c.status === "PENDING") pending++;
        else if (c.status === "IN_PROGRESS") progress++;
        else if (c.status === "RESOLVED") resolved++;
    });

    document.getElementById("pending").innerText = pending;
    document.getElementById("progress").innerText = progress;
    document.getElementById("resolved").innerText = resolved;
}

// ================= DATE =================
function formatDate(dateString) {
    if (!dateString) return "No Date";

    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ================= NAVIGATION =================
function goToProfile() {
    window.location.href = "/Users%20page/User.html";
}

function goToComplaints() {
    window.location.href = "/Complaints/Complaints.html";
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}