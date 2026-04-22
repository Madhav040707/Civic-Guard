document.addEventListener("DOMContentLoaded", () => {
    const profileImage = document.getElementById("profileImage");
    const imageUpload  = document.getElementById("imageUpload");
    const avatarBtn    = document.getElementById("avatarBtn");
    const editBtn      = document.getElementById("editBtn");
    const saveBtn      = document.getElementById("saveBtn");
    const cancelBtn    = document.getElementById("cancelBtn");
    const editBtns     = document.getElementById("editBtns");
    const statusMsg    = document.getElementById("statusMsg");
    const displayName  = document.getElementById("displayName");
    const displayEmail = document.getElementById("displayEmail");

const fieldIds = ["username", "email", "phone"];
let snapshot = {};

// ── Storage helpers ───────────────────────────────────────
function getUser() {
    try { return JSON.parse(localStorage.getItem("user")) || {}; }
    catch { return {}; }
}

function setUser(data) {
    localStorage.setItem("user", JSON.stringify(data));
}

// ── Status message ────────────────────────────────────────
function showStatus(msg, isError = false) {
    statusMsg.textContent = msg;
    statusMsg.className = isError ? "err" : "";
    setTimeout(() => { statusMsg.textContent = ""; statusMsg.className = ""; }, 2800);
}

// ── Refresh live header ───────────────────────────────────
function refreshHeader() {
    displayName.textContent  = document.getElementById("username").value || "Your Name";
    displayEmail.textContent = document.getElementById("email").value    || "—";
}

// ── Load saved profile ────────────────────────────────────
function loadProfile() {
    const user = getUser();
    if (!user) return;

    document.getElementById("username").value = user.name || "";
    document.getElementById("email").value    = user.email || "";
    document.getElementById("phone").value    = user.phone || "";

    // ✅ FIX: fallback + correct path
    if (user.profileImage) {
        profileImage.src = "http://localhost:8080" + user.profileImage;
    } else {
        profileImage.src = "logo.png";
    }

    refreshHeader();
}

// ── Avatar click ─────────────────────────────────────────
avatarBtn.addEventListener("click", () => imageUpload.click());

// ── Image upload (FIXED) ─────────────────────────────────
imageUpload.addEventListener("change", async function () {
    const file = this.files[0];
    if (!file) return;

    const user = getUser();

    // preview
    const reader = new FileReader();
    reader.onload = (e) => { profileImage.src = e.target.result; };
    reader.readAsDataURL(file);

    // upload to backend
    let formData = new FormData();
    formData.append("image", file);
    formData.append("userId", user.id);

    try {
        const res = await fetch("http://localhost:8080/api/user/uploadProfile", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        profileImage.src = "http://localhost:8080" + data.profileImage;
        setUser(data);

        showStatus("Profile image updated ✅");

    } catch (err) {
        console.error(err);
        showStatus("Image upload failed ❌", true);
    }
});

// ── Edit mode ─────────────────────────────────────────────
function enterEditMode() {
    snapshot = {
        name:  document.getElementById("username").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
    };

    fieldIds.forEach(id => { document.getElementById(id).disabled = false; });
    document.getElementById("username").focus();

    editBtns.style.display = "";
    editBtn.classList.add("active");
    statusMsg.textContent = "";
}

function cancelEdit() {
    document.getElementById("username").value = snapshot.name;
    document.getElementById("email").value    = snapshot.email;
    document.getElementById("phone").value    = snapshot.phone;

    fieldIds.forEach(id => { document.getElementById(id).disabled = true; });

    editBtns.style.display = "none";
    editBtn.classList.remove("active");
    refreshHeader();
}

async function saveProfile() {
    const name  = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!name) {
        showStatus("Name cannot be empty.", true);
        return;
    }

    const user = getUser();

    try {
        const res = await fetch("http://localhost:8080/api/user/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: user.id,
                name,
                email,
                phone
            })
        });

        const data = await res.json();

        setUser(data);

        fieldIds.forEach(id => { document.getElementById(id).disabled = true; });
        editBtns.style.display = "none";
        editBtn.classList.remove("active");

        refreshHeader();
        showStatus("Profile updated in database ✅");

    } catch (err) {
        console.error(err);
        showStatus("Update failed ❌", true);
    }
}

// ── Keyboard shortcuts ────────────────────────────────────
document.addEventListener("keydown", (e) => {
    if (editBtns.style.display === "none") return;
    if (e.key === "Enter")  saveProfile();
    if (e.key === "Escape") cancelEdit();
});

// ── Wire up buttons ───────────────────────────────────────
editBtn.addEventListener("click", enterEditMode);
cancelBtn.addEventListener("click", cancelEdit);
saveBtn.addEventListener("click", saveProfile);

// ── Init ──────────────────────────────────────────────────
loadProfile();

});
