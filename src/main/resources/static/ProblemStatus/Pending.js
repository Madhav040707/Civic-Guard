fetch("http://localhost:8080/api/complaints")
    .then(res => res.json())
    .then(data => {
        const filtered = data.filter(c => c.status === "PENDING");
        showComplaints(filtered);
    });

function showComplaints(data) {
    const container = document.querySelector(".complaints");
    container.innerHTML = "";

    data.forEach(c => {

        const card = document.createElement("div");
        card.className = "complaint-card";

        if (c.status === "RESOLVED") card.classList.add("resolved-card");
        if (c.status === "PENDING") card.classList.add("pending-card");
        if (c.status === "IN_PROGRESS") card.classList.add("progress-card");

        if (c.imagePath) {
            const img = document.createElement("img");
            img.src = "http://localhost:8080" + c.imagePath;
            img.className = "complaint-img";
            card.appendChild(img);
        }

        // body
        const body = document.createElement("div");
        body.className = "card-body";

        body.innerHTML = `
            <div class="complaint-title">${c.category}</div>
            <div class="location">📍 ${c.location}</div>
            <div class="description">${c.description}</div>
            <div class="complaint-date">${c.date}</div>
        `;

        card.appendChild(body);
        container.appendChild(card);
    });
}