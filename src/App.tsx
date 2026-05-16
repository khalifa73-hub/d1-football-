import { Switch, Route } from "wouter";
import { useLocation } from "wouter";

function Sidebar() {
  const [location, setLocation] = useLocation();

  const links = [
    ["Dashboard", "/"],
    ["Workouts", "/workouts"],
    ["Nutrition", "/nutrition"],
    ["Progress", "/progress"],
    ["Coach", "/coach"],
  ];

  return (
    <div style={styles.sidebar}>
      <h2 style={{ marginBottom: 20 }}>🏈 D1 App</h2>

      {links.map(([name, path]) => (
        <div
          key={path}
          onClick={() => setLocation(path)}
          style={{
            ...styles.link,
            background: location === path ? "#1f2937" : "transparent",
          }}
        >
          {name}
        </div>
      ))}
    </div>
  );
}

/* PAGES (simple placeholders for now) */
function Dashboard() {
  return <div style={styles.page}>📊 Dashboard</div>;
}
function Workouts() {
  return <div style={styles.page}>💪 Workouts</div>;
}
function Nutrition() {
  return <div style={styles.page}>🍎 Nutrition</div>;
}
function Progress() {
  return <div style={styles.page}>📈 Progress</div>;
}
function Coach() {
  return <div style={styles.page}>🧠 Coach</div>;
}

export default function App() {
  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.content}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/workouts" component={Workouts} />
          <Route path="/nutrition" component={Nutrition} />
          <Route path="/progress" component={Progress} />
          <Route path="/coach" component={Coach} />
        </Switch>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#0b0c10",
    color: "white",
    fontFamily: "system-ui",
  },

  sidebar: {
    width: 220,
    padding: 20,
    background: "#111827",
  },

  link: {
    padding: 10,
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 8,
  },

  content: {
    flex: 1,
    padding: 20,
  },

  page: {
    fontSize: 22,
  },
};
