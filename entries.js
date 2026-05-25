function getWeatherIcon(weather) {
    const type = weather.toLowerCase();

    if (type.includes("clear")) return "☀️";
    if (type.includes("cloud")) return "☁️";
    if (type.includes("rain")) return "🌧️";
    if (type.includes("snow")) return "❄️";
    if (type.includes("thunderstorm")) return "⛈️";
    if (type.includes("mist") || type.includes("fog")) return "🌫️";
    if (type.includes("drizzle")) return "🌦️";

    return "🌤️";
}

function getMoodIcon(mood) {
    const type = mood.toLowerCase();

    if (type.includes("happy")) return "😊";
    if (type.includes("calm")) return "😌";
    if (type.includes("sad")) return "😢";
    if (type.includes("tired")) return "😴";
    if (type.includes("stressed")) return "😵‍💫";
    if (type.includes("angry")) return "😠";
    if (type.includes("excited")) return "🤩";

    return "🙂";
}

async function loadStatistics(){

    const response = await fetch("/api/statistics");
    const stats = await response.json();

    const statisticsBox = document.getElementById("statisticsBox");

    if(stats.length === 0){
        statisticsBox.innerHTML = "";
        return;
    }

    let html = `
        <div class="entry-card">
            <h3>📊 Mood Statistics</h3>
    `;

    stats.forEach(stat => {
        html += `
            <p>${stat.mood}: ${stat.count}</p>
        `;
    });

    html += `</div>`;

    statisticsBox.innerHTML = html;
}

async function loadEntries() {
    const response = await fetch("/api/entries");

    if (!response.ok) {
        window.location.href = "login.html";
        return;
    }

    const entries = await response.json();
    const entriesList = document.getElementById("entriesList");

    if (entries.length === 0) {
        entriesList.innerHTML = "<p>No entries yet.</p>";
        return;
    }

    entriesList.innerHTML = "";

    entries.forEach(entry => {
        const card = document.createElement("div");
        card.className = "entry-card";

        const weatherIcon = getWeatherIcon(entry.weather);
        const moodIcon = getMoodIcon(entry.mood);

        card.innerHTML = `
            <h3>📍 ${entry.city}</h3>
            <p><strong>${weatherIcon} Weather:</strong> ${entry.temperature}°C, ${entry.weather}</p>
            <p><strong>${moodIcon} Mood:</strong> ${entry.mood}</p>
            <p>${entry.note}</p>
            <small>Created at: ${entry.created_at}</small>
            <br>
            <button onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        entriesList.appendChild(card);
    });
}

async function deleteEntry(id) {

    if (!confirm("Delete this entry?")) {
        return;
    }

    const response = await fetch(`/api/entries/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        loadEntries();
    }
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch("/api/logout", {
        method: "POST"
    });

    window.location.href = "login.html";
});

loadEntries();
loadStatistics();
