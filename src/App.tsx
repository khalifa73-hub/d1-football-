import { useEffect, useState } from "react";

const positions = [
  "QB",
  "RB",
  "WR",
  "TE",
  "OL",
  "DL",
  "DE",
  "LB",
  "CB",
  "S",
];

export default function App() {
  const [position, setPosition] = useState("");
  const [foods, setFoods] = useState<string[]>([]);
  const [input, setInput] = useState("");

  // 🔁 daily reset
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

  function resetFood() {
    setFoods([]);
    localStorage.setItem("foods", JSON.stringify([]));
    localStorage.setItem("lastReset", new Date().toDateString());
  }

  return (
    <div style={styles.container}>
      <h1>🏈 D1 Athlete Dashboard</h1>

      {/* DASHBOARD */}
      <div style={styles.card}>
        <h2>📊 Dashboard</h2>
        <p>Welcome athlete. Track everything here.</p>
      </div>

      {/* POSITIONS */}
      <div style={styles.card}>
        <h2>🏈 Football Position</h2>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          style={styles.input}
        >
          <option value="">Select Position</option>
          {positions.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        {position && (
          <p style={{ marginTop: 10 }}>
            🔥 Training Mode: <b>{position}</b>
          </p>
        )}
      </div>

      {/* FOOD TRACKER */}
      <div style={styles.card}>
        <h2>🍎 Food Tracker (Daily Reset)</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter food..."
            style={styles.input}
          />
          <button onClick={addFood} style={styles.button}>
            Add
          </button>
        </div>

        <ul>
          {foods.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>

        <button onClick={resetFood} style={styles.reset}>
          Reset Day
        </button>
      </div>

      {/* SCANNER */}
      <div style={styles.card}>
        <h2>📷 Scanner</h2>
        <p>Camera + barcode scanner coming next update.</p>
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
  card: {
    background: "#1a1a1a",
    padding: 15,
    marginTop: 15,
    borderRadius: 10,
  },
  input: {
    padding: 8,
    width: "100%",
    marginTop: 5,
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
