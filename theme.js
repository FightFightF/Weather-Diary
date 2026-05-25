function applySavedTheme() {
    const savedTheme = localStorage.getItem("darkMode");

    if (savedTheme === "enabled") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

function setupDarkModeButton() {
    const darkModeBtn = document.getElementById("darkModeBtn");

    if (!darkModeBtn) {
        return;
    }

    if (localStorage.getItem("darkMode") === "enabled") {
        darkModeBtn.innerText = "☀️ Light Mode";
    } else {
        darkModeBtn.innerText = "🌙 Dark Mode";
    }

    darkModeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
            darkModeBtn.innerText = "☀️ Light Mode";
        } else {
            localStorage.setItem("darkMode", "disabled");
            darkModeBtn.innerText = "🌙 Dark Mode";
        }
    });
}

applySavedTheme();
setupDarkModeButton();
