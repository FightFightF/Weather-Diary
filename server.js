const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const db = require("./database");
require("dotenv").config({ path: "./server/.env" });

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: "weather_diary_secret",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, "../public")));

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not logged in"});
    }
    next();
}

app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required."});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        function (err){
            if (err) {
                return res.status(400).json({ message: "Email already exists" });
            }

            res.json({ message: "Registration successfull!"});
        }
    );
});

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    
    db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, user) => {
            if (err || !user) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(400).json({ message: "Invalid email or password"});
            }

            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email
            };

            res.json({ message: "Login successful" });
        }
    );
});

app.get("/api/user", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not logged in" });
    }

    res.json(req.session.user);
});

app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out"});
    });
});

app.get("/api/weather/:city", requireLogin, async (req, res) => {
    const city = req.params.city;
    const apiKey = process.env.WEATHER_API_KEY;

    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
            return res.status(400).json({ message: "City not found or API error" });
        }

        res.json({
            city: data.name,
            temperature: data.main.temp,
            weather: data.weather[0].main
        });

    } catch (error) {
        res.status(500).json({ message: "Weather API connection error" });
    }
});

app.post("/api/entries", requireLogin, (req, res) => {
    const { city, weather, temperature, mood, note } = req.body;
    const userId = req.session.user.id;

    db.run(
        `INSERT INTO entries (user_id, city, weather, temperature, mood, note)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, city, weather, temperature, mood, note],
        function (err) {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }

            res.json({ message: "Diary entry saved" });
        }
    );
});

app.get("/api/entries", requireLogin, (req, res) => {
    const userId = req.session.user.id;

    db.all(
        "SELECT * FROM entries WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
        (err, entries) => {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }

            res.json(entries);
        }
    );
});

app.delete("/api/entries/:id", requireLogin, (req, res) => {
    const entryId = req.params.id;
    const userId = req.session.user.id;

    db.run(
        "DELETE FROM entries WHERE id = ? AND user_id = ?",
        [entryId, userId],
        function (err) {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }

            res.json({ message: "Entry deleted" });
        }
    );
});

app.get("/api/statistics", requireLogin, (req, res) => {

    const userId = req.session.user.id;

    db.all(
        `
        SELECT mood, COUNT(*) as count
        FROM entries
        WHERE user_id = ?
        GROUP BY mood
        `,
        [userId],
        (err, rows) => {

            if(err){
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.json(rows);
        }
    );
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
