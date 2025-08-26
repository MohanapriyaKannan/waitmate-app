let checkInTime = null;
let timerInterval = null;

const checkInBtn = document.getElementById("checkin");
const checkOutBtn = document.getElementById("checkout");
const placeSelect = document.getElementById("place");
const timerDisplay = document.getElementById("timer");
const avgTimesList = document.querySelector("#avg-times ul");

// Format seconds → HH:MM:SS
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return (
    String(hrs).padStart(2, "0") +
    ":" +
    String(mins).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}

// Update live timer
function updateTimer() {
  if (checkInTime) {
    const seconds = Math.floor((Date.now() - checkInTime) / 1000);
    timerDisplay.textContent = "⏱ " + formatTime(seconds);
  }
}

// Fetch average wait times
async function loadAverages() {
  const res = await fetch("/api/wait-times");
  const data = await res.json();

  avgTimesList.innerHTML = "";
  for (let place in data) {
    for (let seg in data[place]) {
      const li = document.createElement("li");
      li.textContent = `${place} (${seg}): ${formatTime(
        Math.round(data[place][seg]),
      )}`;
      avgTimesList.appendChild(li);
    }
  }
}

// Handle Check In
checkInBtn.addEventListener("click", () => {
  if (checkInTime) {
    alert("Already checked in! Please check out first.");
    return;
  }
  checkInTime = Date.now();
  timerDisplay.textContent = "⏱ 00:00:00";
  timerInterval = setInterval(updateTimer, 1000);
});

// Handle Check Out
checkOutBtn.addEventListener("click", async () => {
  if (!checkInTime) {
    alert("You need to check in first!");
    return;
  }

  clearInterval(timerInterval);
  const duration = Math.floor((Date.now() - checkInTime) / 1000);
  checkInTime = null;

  timerDisplay.textContent = `✅ Session recorded: ${formatTime(duration)}`;

  // Send duration to server
  const place = placeSelect.value;
  await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ place, duration }),
  });

  loadAverages();
});

// Load averages on page start
loadAverages();
