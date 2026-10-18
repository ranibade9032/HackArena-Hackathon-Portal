
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;
const dataFile = path.join(__dirname, "teams.json");

app.use(cors());
app.use(express.json());

function readTeams() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]", "utf8");
  }
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf8") || "[]");
  } catch (error) {
    console.error("Error reading teams.json:", error);
    return [];
  }
}

function saveTeams(teams) {
  fs.writeFileSync(dataFile, JSON.stringify(teams, null, 2), "utf8");
}

app.get("/", (req, res) => {
  res.send("HackArena Backend is running!");
});

app.get("/api/teams", (req, res) => {
  res.json(readTeams());
});

app.post("/api/teams", (req, res) => {
  const { team, event, members } = req.body || {};

  if (
    typeof team !== "string" || !team.trim() ||
    typeof event !== "string" || !event.trim() ||
    !Array.isArray(members) || members.length < 1 || members.length > 20
  ) {
    return res.status(400).json({
      message: "Enter team name, event name, and 1–20 participants."
    });
  }

  const valid = members.every(m =>
    m && typeof m.name === "string" && m.name.trim() &&
    typeof m.roll === "string" && m.roll.trim() &&
    typeof m.dept === "string" && m.dept.trim() &&
    typeof m.section === "string" && m.section.trim()
  );

  if (!valid) {
    return res.status(400).json({
      message: "Fill all participant details."
    });
  }

  const teams = readTeams();
  const newTeam = {
    id: Date.now().toString(),
    team: team.trim(),
    event: event.trim(),
    members: members.map(m => ({
      name: m.name.trim(),
      roll: m.roll.trim(),
      dept: m.dept.trim(),
      section: m.section.trim()
    }))
  };

  teams.push(newTeam);

  try {
    saveTeams(teams);
    res.status(201).json({
      message: "Team registered successfully!",
      team: newTeam
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message:"Could not save team data."});
  }
});

app.delete("/api/teams", (req, res) => {
  try {
    saveTeams([]);
    res.json({message:"All teams deleted."});
  } catch (error) {
    console.error(error);
    res.status(500).json({message:"Could not delete team data."});
  }
});

app.listen(PORT, () => {
  console.log(`HackArena backend running on http://localhost:${PORT}`);
});
