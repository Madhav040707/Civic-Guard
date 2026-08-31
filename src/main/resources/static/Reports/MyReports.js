

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
        try {
            return JSON.parse(localStorage.getItem("user")) || {};
        } catch {
            return {};
        }
    }

    function setUser(data) {
        localStorage.setItem("user", JSON.stringify(data));
    }

    // ── Status message ────────────────────────────────────────

    function showStatus(msg, isError = false) {
        if (!statusMsg) return;

        statusMsg.textContent = msg;
        statusMsg.className = isError ? "err" : "";

        setTimeout(() => {
            statusMsg.textContent = "";
            statusMsg.className = "";
        }, 2800);
    }

    // ── Refresh live header ───────────────────────────────────

    function refreshHeader() {
        const username = document.getElementById("username");
        const email = document.getElementById("email");

        if (displayName && username) {
            displayName.textContent = username.value || "Your Name";
        }

        if (displayEmail && email) {
            displayEmail.textContent = email.value || "—";
        }
    }

    // ── Load saved profile ────────────────────────────────────

    function loadProfile() {
        const user = getUser();

        if (!user || !user.id) {
            console.warn("No logged-in user found.");
            return;
        }

        document.getElementById("username").value = user.name || "";
        document.getElementById("email").value = user.email || "";
        document.getElementById("phone").value = user.phone || "";

        // Profile image
        if (user.profileImage) {
            profileImage.src = BASE_URL + user.profileImage;
        } else {
            profileImage.src = "logo.png";
        }

        refreshHeader();
    }

    // ── Avatar click ──────────────────────────────────────────

    if (avatarBtn && imageUpload) {
        avatarBtn.addEventListener("click", () => {
            imageUpload.click();
        });
    }

    // ── Image upload ──────────────────────────────────────────

    if (imageUpload) {
        imageUpload.addEventListener("change", async function () {

            const file = this.files[0];

            if (!file) return;

            const user = getUser();

            if (!user.id) {
                showStatus("User not found. Please login again.", true);
                return;
            }

            // Preview
            const reader = new FileReader();

            reader.onload = (e) => {
                if (profileImage) {
                    profileImage.src = e.target.result;
                }
            };

            reader.readAsDataURL(file);

            // Upload
            const formData = new FormData();

            formData.append("image", file);
            formData.append("userId", user.id);

            try {

                const res = await fetch(
                    `${BASE_URL}/api/user/uploadProfile`,
                    {
                        method: "POST",
                        body: formData
                    }
                );

                if (!res.ok) {
                    throw new Error(`Upload failed: ${res.status}`);
                }

                const data = await res.json();

                if (data.profileImage && profileImage) {
                    profileImage.src = BASE_URL + data.profileImage;
                }

                setUser(data);

                showStatus("Profile image updated ✅");

            } catch (err) {

                console.error("Profile image upload error:", err);

                // Restore old image if upload fails
                if (user.profileImage && profileImage) {
                    profileImage.src = BASE_URL + user.profileImage;
                }

                showStatus("Image upload failed ❌", true);
            }
        });
    }

    // ── Edit mode ─────────────────────────────────────────────

    function enterEditMode() {

        snapshot = {
            name: document.getElementById("username").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value
        };

        fieldIds.forEach(id => {
            document.getElementById(id).disabled = false;
        });

        document.getElementById("username").focus();

        editBtns.style.display = "";
        editBtn.classList.add("active");

        statusMsg.textContent = "";
    }

    // ── Cancel edit ───────────────────────────────────────────

    function cancelEdit() {

        document.getElementById("username").value = snapshot.name;
        document.getElementById("email").value = snapshot.email;
        document.getElementById("phone").value = snapshot.phone;

        fieldIds.forEach(id => {
            document.getElementById(id).disabled = true;
        });

        editBtns.style.display = "none";
        editBtn.classList.remove("active");

        refreshHeader();
    }

    // ── Save profile ──────────────────────────────────────────

    async function saveProfile() {

        const name = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();

        if (!name) {
            showStatus("Name cannot be empty.", true);
            return;
        }

        const user = getUser();

        if (!user.id) {
            showStatus("User not found. Please login again.", true);
            return;
        }

        try {

            const res = await fetch(
                `${BASE_URL}/api/user/update`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        id: user.id,
                        name,
                        email,
                        phone
                    })
                }
            );

            if (!res.ok) {
                throw new Error(`Update failed: ${res.status}`);
            }

            const data = await res.json();

            setUser(data);

            fieldIds.forEach(id => {
                document.getElementById(id).disabled = true;
            });

            editBtns.style.display = "none";
            editBtn.classList.remove("active");

            refreshHeader();

            showStatus("Profile updated in database ✅");

        } catch (err) {

            console.error("Profile update error:", err);

            showStatus("Update failed ❌", true);
        }
    }

    // ── Keyboard shortcuts ────────────────────────────────────

    document.addEventListener("keydown", (e) => {

        if (editBtns.style.display === "none") {
            return;
        }

        if (e.key === "Enter") {
            saveProfile();
        }

        if (e.key === "Escape") {
            cancelEdit();
        }
    });

    // ── Wire up buttons ───────────────────────────────────────

    if (editBtn) {
        editBtn.addEventListener("click", enterEditMode);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", cancelEdit);
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", saveProfile);
    }

    // ── Init ──────────────────────────────────────────────────
    loadProfile();

});
