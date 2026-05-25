let currentWeather = null;

async function loadUser() {
    const response = await fetch("/api/user");

    if (!response.ok) {
        window.location.href = "login.html";
        return;
    }

    const user = await response.json();
    document.getElementById("welcomeText").innerText = `Welcome, ${user.username}`;
}

loadUser();

const weatherForm = document.getElementById("weatherForm");

weatherForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const city = document.getElementById("city").value;

    document.getElementById("weatherResult").innerHTML = `<div class="weather-box">⏳ Loading weather...</div>`;

    const response = await fetch(`/api/weather/${city}`);
    const data = await response.json();

    if (!response.ok) {
        document.getElementById("weatherResult").innerText = data.message;
        return;
    }

    currentWeather = data;

    const weatherType = data.weather.toLowerCase();

    let weatherIcon = "🌤️";

    if (weatherType.includes("cloud")) {
        weatherIcon = "☁️";
    } 
    else if (weatherType.includes("rain")) {
        weatherIcon = "🌧️";
    } 
    else if (weatherType.includes("clear")) {
        weatherIcon = "☀️";
    } 
    else if (weatherType.includes("snow")) {
        weatherIcon = "❄️";
    } 
    else if (weatherType.includes("thunderstorm")) {
        weatherIcon = "⛈️";
    }

    document.getElementById("weatherResult").innerHTML = ` 
        <div class="weather-box">
            <h3>${weatherIcon} ${data.city}</h3>
            <p>${data.temperature}°C</p>
            <p>${data.weather}</p>
        </div>
    `;

    document.getElementById("entryForm").style.display = "flex";
});

const entryForm = document.getElementById("entryForm");

entryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mood = document.getElementById("mood").value;
    const note = document.getElementById("note").value;

    const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            city: currentWeather.city,
            weather: currentWeather.weather,
            temperature: currentWeather.temperature,
            mood,
            note
        })
    });

    const data = await response.json();
    document.getElementById("message").innerHTML = `<span class="success">✅ ${data.message}</span>`;

    if (response.ok) {
        entryForm.reset();
    }
});

const dashboardLogoutBtn = document.getElementById("dashboardLogoutBtn");

if (dashboardLogoutBtn) {
    dashboardLogoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        await fetch("/api/logout", {
            method: "POST"
        });

        window.location.href = "login.html";
    });
}
