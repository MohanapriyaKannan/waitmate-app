const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const dbPath = path.join(__dirname, "data.json");

function getTimeSegment() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
}

// Get average wait times
app.get("/api/wait-times", (req, res) => {
  const data = JSON.parse(fs.readFileSync(dbPath));
  const result = {};

  for (let place in data) {
    result[place] = {};
    for (let segment in data[place]) {
      let times = data[place][segment];
      let avg = times.length
        ? times.reduce((a, b) => a + b, 0) / times.length
        : 0;
      result[place][segment] = avg.toFixed(2);
    }
  }

  res.json(result);
});

// Save check-in/out time
app.post("/api/submit", (req, res) => {
  const { place, duration } = req.body;
  const segment = getTimeSegment();
  const data = JSON.parse(fs.readFileSync(dbPath));

  if (!data[place]) {
    data[place] = { Morning: [], Afternoon: [], Evening: [], Night: [] };
  }
  data[place][segment].push(duration);

  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  res.json({ status: "success", segment });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
