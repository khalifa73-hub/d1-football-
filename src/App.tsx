import { useEffect, useState } from "react";

const positions = ["QB","RB","WR","TE","OL","DL","DE","LB","CB","S"];

export default function App() {
  const [position, setPosition] = useState("");
  const [foods, setFoods] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const last = localStorage.getItem("lastReset");
    const today = new Date().toDateString();

    if (last !== today) {
      localStorage.setItem("foods", JSON.stringify([]));
      localStorage.setItem("lastReset", today);
    }

    const saved = localStorage.getItem("foods");
    if (saved) setFoods(JSON.parse(saved));
  }, []);

  function addFood() {
    if (!input.trim()) return;
    const updated = [...foods, input];
    setFoods(updated);
    localStorage.setItem("foods", JSON.stringify(updated));
    setInput("");
  }

  function resetDay() {
    setFoods([]);
    localStorage.setItem("foods", JSON.stringify([]));
    localStorage.setItem("lastReset", new Date().toDateString());
  }

  return (
    <div style={styles.container}>
      <h1>🏈 D1 Athlete Pro Dashboard</h1>

      {/* STATS DASHBOARD */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>🔥 Status</h3>
          <p>Elite Mode Active</p>
        </div>

        <div style={styles.card}>
          <h3>🏈 Position</h3>
          <p>{position || "Not Selected"}</p>
        </div>

        <div style={styles.card}>
          <h3>🍎 Foods Today</h3>
          <p>{foods.length}</p>
        </div>
      </div>

      {/* POSITION */}
      <div style={styles.card}>
        <h2>🏈 Select Position</h2>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          style={styles.input}
        >
          <option value="">Choose Position</option>
          {positions.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        {position && (
          <p>💪 Training Mode: <b>{position}</b></p>
        )}
      </div>

      {/* FOOD TRACKER */}
      <div style={styles.card}>
        <h2>🍎 Nutrition Tracker</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter food..."
            style={styles.input}
          />
          <button onClick={addFood} style={styles.button}>Add</button>
        </div>

        <ul>
          {foods.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>

        <button onClick={resetDay} style={styles.reset}>Reset Day</button>
      </div>

      {/* SCANNER UPGRADE */}
      <div style={styles.card}>
        <h2>📷 Food Scanner</h2>

        <button
          onClick={() => setScanning(!scanning)}
          style={styles.button}
        >
          {scanning ? "Stop Scan" : "Start Scan"}
        </button>

        {scanning && (
          <div style={{ marginTop: 10 }}>
            <p>📸 Camera is ON (simulated)</p>
            <p>Point camera at food...</p>
          </div>
        )}
      </div>

      {/* TRAINING */}
      <div style={styles.card}>
        <h2>🏈 Training System</h2>

        {position ? (
          <p>
            Today’s focus: <b>{position} strength & explosiveness</b>
          </p>
        ) : (
          <p>Select a position to unlock training</p>
        )}
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    padding: 20,
    fontFamily: "Arial",
    background: "#0f0f0f",
    color: "white",
    minHeight: "100vh",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },
  card: {
    background: "#1a1a1a",
    padding: 15,
    marginTop: 15,
    borderRadius: 10,
  },
  input: {
    padding: 8,
    width: "100%",
  },
  button: {
    padding: 8,
    cursor: "pointer",
  },
  reset: {
    marginTop: 10,
    padding: 8,
    background: "red",
    color: "white",
    border: "none",
  },
};
