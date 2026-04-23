function checkAuth() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "ADMIN") {
        alert("Access Denied ❌");
        window.location.href = "index.html";
    }
}

window.onload = function () {
    console.log("Js is started");
    checkAuth();
    loadUser();
    fetchAllComplaints();
};

async function loadUser() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) return;

    try {
        const res = await fetch(`http://localhost:8080/api/user/${user.email}`);

        if (!res.ok) {
            throw new Error("Failed to fetch user");
        }

        const data = await res.json();

        const hour = new Date().getHours();
        let greeting = "Good Morning";
        if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
        else if (hour >= 17) greeting = "Good Evening";

        const title = document.getElementById("d2");
        if (title) {
            title.innerText = `${greeting}, ${data.name}! 👋`;
        }

        localStorage.setItem("user", JSON.stringify({
            ...user,
            ...data
        }));

        const img = document.getElementById("profileImg");
        if (img) {
            if (data.profileImage) {
                img.src = "http://localhost:8080" + data.profileImage;
            } else {
                img.src = "logo.png";
            }
        }

    } catch (err) {
        console.error("Error loading user:", err);
    }
}

function fetchAllComplaints() {
    fetch("http://localhost:8080/api/complaints")
        .then(res => res.json())
        .then(data => {
            console.log("ADMIN DATA:", data);
            showComplaints(data);
            updateStats(data);
        })
        .catch(err => {
            console.error(err);
            alert("Error loading complaints ❌");
        });
}

function showComplaints(data) {
    console.log("Rendering complaints:", data);
    const container = document.querySelector(".complaints");
    if (!container) return;

    container.innerHTML = "";

    data.forEach(c => {

        const id = c._id || c.id;

        const card = document.createElement("div");
        card.className = "complaint-card";

        if (c.imagePath) {
            const img = document.createElement("img");
            img.src = "http://localhost:8080" + c.imagePath;
            img.className = "complaint-img";

            // ✅ KEEP THIS (for complaints)
            img.onclick = () => openImage(img.src, id);

            card.appendChild(img);
        }

        const body = document.createElement("div");
        body.className = "card-body";

        const title = document.createElement("div");
        title.className = "complaint-title";
        title.innerText = c.category || "No Category";
        body.appendChild(title);

        const loc = document.createElement("div");
        loc.className = "location";
        loc.innerHTML = `📍 ${c.location || "Unknown"}`;
        body.appendChild(loc);

        const desc = document.createElement("div");
        desc.className = "description";
        desc.innerText = c.description || "No Description";
        body.appendChild(desc);

        const date = document.createElement("div");
        date.className = "complaint-date";
        const complaintDate = c.createdAt || c.date;
        date.innerText = complaintDate ? formatDate(complaintDate) : "No Date";
        body.appendChild(date);

        card.appendChild(body);

        const template = document.getElementById("actionTemplate");
        if (template) {
            const actions = template.content.cloneNode(true);

            actions.querySelector(".pending-btn").onclick =
                () => updateStatus(id, "PENDING");

            actions.querySelector(".progress-btn").onclick =
                () => updateStatus(id, "IN_PROGRESS");

            actions.querySelector(".resolved-btn").onclick =
                () => updateStatus(id, "RESOLVED");

            card.appendChild(actions);
        }

        container.appendChild(card);
    });
}

function updateStats(data) {
    let pending = 0;
    let progress = 0;
    let resolved = 0;

    data.forEach(c => {
        if (c.status === "PENDING") pending++;
        else if (c.status === "IN_PROGRESS") progress++;
        else if (c.status === "RESOLVED") resolved++;
    });

    document.getElementById("p1").innerText = data.length;
    document.querySelector("#s2 .stat-num").innerText = pending;
    document.querySelector("#s3 .stat-num").innerText = progress;
    document.querySelector("#s4 .stat-num").innerText = resolved;
}

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

let currentComplaintId = null;

// ✅ FIXED FUNCTION (WORKS FOR BOTH PROFILE + COMPLAINT)
function openImage(src, id = null) {
    const modal = document.getElementById("imageModal");
    const img = document.getElementById("fullImage");

    if (modal && img) {
        modal.style.display = "flex";
        img.src = src;

        if (id) {
            currentComplaintId = id;
        }
    }
}

function closeImage() {
    const modal = document.getElementById("imageModal");
    if (modal) modal.style.display = "none";
}

function updateStatus(id, status) {
    fetch(`http://localhost:8080/api/complaints/${id}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: status })
    })
        .then(res => {
            if (!res.ok) throw new Error("Update failed");
            return res.json();
        })
        .then(() => {
            alert("Status updated ✅");
            fetchAllComplaints();
        })
        .catch(err => {
            console.error(err);
            alert("Error updating status ❌");
        });
}

function goToResolved(){
    window.location.href = "/ProblemStatus/Resolved.html";
}
function goToPending(){
    window.location.href = "/ProblemStatus/Pending.html";
}
function goToInProgress(){
    window.location.href = "/ProblemStatus/InProgress.html";
}
function goTOMyReports(){
    window.location.href="/Reports/MyReports.html";
}
function logout() {
    localStorage.removeItem("user");
    window.location.replace("/");
}
function goToProfile() {
    window.location.href = "/Users%20page/User.html";
}
function goToComplaints() {
    window.location.href = "/Complaints/Complaints.html";
}

async function submitComplaint() {
    const description = document.getElementById("desc").value;
    const category = document.getElementById("category").value;
    const location = document.getElementById("selectedLocation").innerText;
    const imageFile = document.getElementById("image").files[0];

    if (!description || !category || location === "No location selected") {
        alert("Please fill all fields ❌");
        return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("category", category);
    formData.append("location", location);

    if (imageFile) {
        formData.append("image", imageFile);
    }

    try {
        const res = await fetch("http://localhost:8080/api/complaints", {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            throw new Error("Failed to submit complaint");
        }

        alert("Complaint submitted successfully ✅");

        closeForm();
        fetchAllComplaints(); // refresh data

    } catch (err) {
        console.error(err);
        alert("Error submitting complaint ❌");
    }
}
function getMyLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported ❌");
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        document.getElementById("selectedLocation").innerText =
            `Lat: ${lat}, Lng: ${lon}`;
    }, () => {
        alert("Location access denied ❌");
    });
}

document.getElementById("addBtn").onclick = function () {
    document.getElementById("formModal").style.display = "flex";
};