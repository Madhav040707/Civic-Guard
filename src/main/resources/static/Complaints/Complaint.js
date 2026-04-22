async function loadComplaints() {
    try {
        const res = await fetch("http://localhost:8080/api/complaints");
        const data = await res.json();

        console.log("Complaints:", data);

        renderTable(data);
        updateStats(data);

    } catch (err) {
        console.error("Error loading complaints:", err);
    }
}

window.onload = loadComplaints;
function renderTable(data) {
    const tableBody = document.getElementById("tableBody");
    const emptyState = document.getElementById("emptyState");

    tableBody.innerHTML = "";

    if (!data || data.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    data.forEach(c => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td class="complaint-id">#${c.id}</td>

            <td class="complaint-title">
                ${c.title || "No Title"}
                <small>${c.description || ""}</small>
            </td>

            <td class="user-cell">
                <div class="user-avatar">${getInitials(c.userName)}</div>
                <div>
                    <div class="user-name">${c.userName || "Unknown"}</div>
                    <small>ID: ${c.userId || "N/A"}</small>
                </div>
            </td>

            <td><span class="cat-badge">${c.category || "General"}</span></td>

            <td>
                <span class="priority-dot priority-${(c.priority || "low").toLowerCase()}"></span>
                ${c.priority || "Low"}
            </td>

            <td>
                <span class="badge ${getStatusClass(c.status)}">
                    ${c.status}
                </span>
            </td>

            <td class="date-cell">
                ${formatDate(c.createdAt)}
            </td>

            <td>
                <button class="action-btn">View</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function updateStats(data) {
    const total = data.length;

    const open = data.filter(c => c.status === "OPEN").length;
    const progress = data.filter(c => c.status === "IN_PROGRESS").length;
    const resolved = data.filter(c => c.status === "RESOLVED").length;

    document.getElementById("statTotal").innerText = total;
    document.getElementById("statOpen").innerText = open;
    document.getElementById("statProgress").innerText = progress;
    document.getElementById("statResolved").innerText = resolved;
}

function getStatusClass(status) {
    if (!status) return "badge-open";

    switch (status) {
        case "OPEN": return "badge-open";
        case "IN_PROGRESS": return "badge-progress";
        case "RESOLVED": return "badge-resolved";
        case "CLOSED": return "badge-closed";
        default: return "badge-open";
    }
}

function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
}

function getInitials(name) {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
}