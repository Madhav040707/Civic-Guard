function checkAuth() {
    const user = localStorage.getItem("user");

    if (!user) {
        window.location.href = "index.html";
    }
}
window.onload = function () {
    checkAuth();
    loadUser();
    fetchGlobalStats();   // ✅ ONLY THIS for stats
    fetchComplaints();    // ✅ only for list
    fetchNotifications();
};

async function loadUser() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) return;

    try {
        // fetch latest user from DB
        const res = await fetch(`http://localhost:8080/api/user/${user.email}`);
        const data = await res.json();

        // greeting
        const hour = new Date().getHours();
        let greeting = "Good Morning";
        if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
        else if (hour >= 17) greeting = "Good Evening";

        const title = document.getElementById("d2");
        if (title) {
            title.innerText = `${greeting}, ${data.name}! 👋`;
        }

        const img = document.getElementById("profileImg");
        if (img) {
            if (data.profileImage) {
                img.src = "http://localhost:8080" + data.profileImage;
            } else {
                img.src = "logo.png";
            }
            img.onclick = () => openImage(img.src);
        }

        // update localStorage
        localStorage.setItem("user", JSON.stringify(data));

    } catch (err) {
        console.error(err);
    }
}

// ================= FETCH COMPLAINTS =================
function fetchComplaints() {
    const user = JSON.parse(localStorage.getItem("user"));

    fetch(`http://localhost:8080/api/complaints/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
            showComplaints(data); // ✅ ONLY show list
        })
        .catch(err => {
            console.error(err);
            alert("Error loading complaints ❌");
        });
}

// ================= SHOW COMPLAINTS =================
function showComplaints(data) {
    const container = document.querySelector(".complaints");
    if (!container) return;

    container.innerHTML = "";

    data.forEach(c => {
        const card = document.createElement("div");
        card.className = "complaint-card";

        if (c.imagePath) {
            const img = document.createElement("img");
            img.src = "http://localhost:8080" + c.imagePath;
            img.className = "complaint-img";
            img.onclick = () => openImage(img.src, c.id);
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
        date.innerText = formatDate(c.createdAt);
        body.appendChild(date);

        card.appendChild(body);
        container.appendChild(card);
    });
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

// ================= MODAL =================
const addBtn = document.getElementById("addBtn");
if (addBtn) {
    addBtn.onclick = () => {
        document.getElementById("formModal").style.display = "flex";
    };
}

function closeForm() {
    const modal = document.getElementById("formModal");
    if (modal) modal.style.display = "none";
}

// ================= LOCATION =================
let selectedAddress = "";

function getMyLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported ❌");
        return;
    }

    document.getElementById("selectedLocation").innerText = "Fetching location...";

    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(res => res.json())
                .then(data => {
                    selectedAddress = data.display_name;
                    document.getElementById("selectedLocation").innerText = selectedAddress;
                })
                .catch(() => {
                    selectedAddress = `${lat}, ${lng}`;
                    document.getElementById("selectedLocation").innerText = selectedAddress;
                });
        },
        () => alert("Location permission denied ❌")
    );
}

function submitComplaint() {
    if (!selectedAddress) return alert("Please select location ❗");

    const file = document.getElementById("image").files[0];
    if (!file) return alert("Please select an image ❗");

    let formData = new FormData();
    const user = JSON.parse(localStorage.getItem("user"));
    formData.append("userId", user.id);
    formData.append("description", document.getElementById("desc").value);
    formData.append("category", document.getElementById("category").value);
    formData.append("location", selectedAddress);
    formData.append("image", file);

    fetch("http://localhost:8080/api/complaints/upload", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(() => {
            alert("Complaint Submitted ✅");
            closeForm();
            fetchComplaints();
        })
        .catch(err => {
            console.error(err);
            alert("Error submitting complaint ❌");
        });
}

// ================= IMAGE MODAL =================
let currentComplaintId = null;

function openImage(src, id) {
    const modal = document.getElementById("imageModal");
    const img = document.getElementById("fullImage");

    if (modal && img) {
        modal.style.display = "flex";
        img.src = src;
        currentComplaintId = id; // ✅ store id
    }
}

function closeImage() {
    const modal = document.getElementById("imageModal");
    if (modal) modal.style.display = "none";
}

// ================= SIDEBAR =================
const menuBtn = document.getElementById("menuToggle");
const sidebar = document.getElementById("d1");
const overlay = document.getElementById("overlay");

if (menuBtn && sidebar && overlay) {
    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });
}

// ================= NAVIGATION =================

// ================= PROFILE IMAGE UPLOAD =================
const profileImg = document.getElementById("profileImg");
const uploadInput = document.getElementById("uploadProfile");

if (profileImg && uploadInput) {

    // click image → open file picker
    profileImg.addEventListener("click", () => {
        uploadInput.click();
    });

    // upload image
    uploadInput.addEventListener("change", async function () {
        const file = this.files[0];
        if (!file) return;

        const user = JSON.parse(localStorage.getItem("user"));

        let formData = new FormData();
        formData.append("image", file);
        formData.append("userId", user.id);

        try {
            const res = await fetch("http://localhost:8080/api/user/uploadProfile", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            profileImg.src = "http://localhost:8080" + data.profileImage;

            localStorage.setItem("user", JSON.stringify(data));

            alert("Profile image updated ✅");

        } catch (err) {
            console.error(err);
            alert("Upload failed ❌");
        }
    });
}

function fetchNotifications() {
    const user = JSON.parse(localStorage.getItem("user"));

    fetch(`http://localhost:8080/api/notifications/${user.id}`)
        .then(res => res.json())
        .then(data => showNotifications(data))
        .catch(err => console.error(err));
}
function showNotifications(data) {
    const bell = document.querySelector(".notification-bell");

    let old = document.querySelector(".notif-dropdown");
    if (old) old.remove();

    let box = document.createElement("div");
    box.className = "notif-dropdown";

    if (data.length === 0) {
        box.innerHTML = "<p style='padding:10px'>No notifications</p>";
    } else {
        data.forEach(n => {
            let item = document.createElement("div");
            item.className = "notif-item";
            item.innerText = n.message;
            box.appendChild(item);
        });
    }

    bell.appendChild(box);

    // 🔴 red dot logic
    let unread = data.some(n => n.status === "UNREAD");
    let dot = document.querySelector(".notif-dot");
    if (dot) {
        dot.style.display = unread ? "block" : "none";
    }

    // ⏱️ AUTO CLOSE AFTER 5 SECONDS
    setTimeout(() => {
        if (box) {
            box.remove();
        }
    }, 5000);
}

const bell = document.querySelector(".notification-bell");
if (bell) {
    bell.addEventListener("click", fetchNotifications);
}

function goTOMyReports(){
    window.location.href="/Reports/MyReports.html";
}
function goToProfile() {
    window.location.href = "/Users%20page/User.html";
}

function goToComplaints() {
    window.location.href = "/Complaints/Complaints.html";
}

function logout() {
    localStorage.clear();
    window.location.replace("/");
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

function fetchGlobalStats() {
    fetch("http://localhost:8080/api/complaints")
        .then(res => res.json())
        .then(data => updateStats(data)) // 🔥 reuse same function
        .catch(err => console.error(err));
}