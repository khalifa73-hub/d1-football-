import { useEffect, useState } from "react";

const positions = ["QB","RB","WR","TE","OL","DL","DE","LB","CB","S"];

export default function App() {
  const [position, setPosition] = useState("");
  const [foods, setFoods] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [scanActive, setScanActive] = useState(false);

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
    <div style={styles.page}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h1>🏈 Athlete Performance OS</h1>
        <p style={{ opacity: 0.7 }}>
          Train • Track • Dominate
        </p>
      </div>

      {/* TOP STATS */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <p style={styles.label}>STATUS</p>
          <h2>ACTIVE</h2>
        </div>

        <div style={styles.card}>
          <p style={styles.label}>POSITION</p>
          <h2>{position || "NONE"}</h2>
        </div>

        <div style={styles.card}>
          <p style={styles.label}>FOOD LOG</p>
          <h2>{foods.length}</h2>
        </div>
      </div>

      {/* POSITION */}
      <div style={styles.cardWide}>
        <h2>🏈 Position Focus</h2>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          style={styles.select}
        >
          <option value="">Select Position</option>
          {positions.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        {position && (
          <div style={styles.glowBox}>
            🔥 Training Mode: <b>{position}</b>
          </div>
        )}
      </div>

      {/* FOOD */}
      <div style={styles.cardWide}>
        <h2>🍎 Nutrition Tracking</h2>

        <div style={styles.row}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Log food..."
            style={styles.input}
          />
          <button onClick={addFood} style={styles.button}>
            Add
          </button>
        </div>

        <div style={styles.foodList}>
          {foods.map((f, i) => (
            <div key={i} style={styles.foodItem}>
              {f}
            </div>
          ))}
        </div>

        <button onClick={resetDay} style={styles.danger}>
          Reset Day
        </button>
      </div>

      {/* SCANNER */}
      <div style={styles.cardWide}>
        <h2>📷 AI Scanner</h2>

        <button
          onClick={() => setScanActive(!scanActive)}
          style={styles.button}
        >
          {scanActive ? "Stop Scan" : "Start Scan"}
        </button>

        {scanActive && (
          <div style={styles.scanBox}>
            <p>📸 Camera Active (simulated)</p>
            <p style={{ opacity: 0.7 }}>
              Point camera at food for analysis...
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

const styles: any = {
  page: {
    padding: 20,
    background: "#0b0f14",
    color: "white",
    fontFamily: "system-ui",
    minHeight: "100vh",
  },

  header: {
    marginBottom: 20,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },

  card: {
    background: "#111823",
    padding: 15,
    borderRadius: 12,
    border: "1px solid #1f2a3a",
  },

  cardWide: {
    background: "#111823",
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    border: "1px solid #1f2a3a",
  },

  label: {
    fontSize: 12,
    opacity: 0.6,
  },

  select: {
    width: "100%",
    padding: 10,
    marginTop: 10,
  },

  glowBox: {
    marginTop: 10,
    padding: 10,
    background: "rgba(0,255,150,0.1)",
    border: "1px solid rgba(0,255,150,0.3)",
    borderRadius: 10,
  },

  row: {
    display: "flex",
    gap: 10,
  },

  input: {
    flex: 1,
    padding: 10,
  },

  button: {
    padding: "10px 14px",
    cursor: "pointer",
    background: "#2b6fff",
    border: "none",
    color: "white",
    borderRadius: 8,
  },

  danger: {
    marginTop: 10,
    padding: 10,
    background: "red",
    color: "white",
    border: "none",
    borderRadius: 8,
  },

  foodList: {
    marginTop: 10,
  },

  foodItem: {
    padding: 8,
    borderBottom: "1px solid #1f2a3a",
  },

  scanBox: {
    marginTop: 10,
    padding: 15,
    border: "1px dashed #2b6fff",
    borderRadius: 10,
  },
};
