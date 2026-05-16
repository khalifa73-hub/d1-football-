import React from "react"

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#111', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* Sidebar Navigation Left Panel */}
      <nav style={{ width: '250px', backgroundColor: '#1a1a1a', padding: '20px', borderRight: '1px solid #333' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#e50914' }}>D1 Athlete App</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <li><a href="/" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</a></li>
          <li><a href="/workouts" style={{ color: '#fff', textDecoration: 'none' }}>Workouts</a></li>
          <li><a href="/nutrition" style={{ color: '#fff', textDecoration: 'none' }}>Nutrition</a></li>
          <li><a href="/progress" style={{ color: '#fff', textDecoration: 'none' }}>Progress</a></li>
          <li><a href="/coach" style={{ color: '#fff', textDecoration: 'none' }}>Coach</a></li>
          <li><a href="/recruiting" style={{ color: '#fff', textDecoration: 'none' }}>Recruiting</a></li>
          <li><a href="/recovery" style={{ color: '#fff', textDecoration: 'none' }}>Recovery</a></li>
          <li><a href="/film" style={{ color: '#fff', textDecoration: 'none' }}>Film</a></li>
          <li><a href="/more" style={{ color: '#fff', textDecoration: 'none' }}>More</a></li>
        </ul>
      </nav>

      {/* Main Page Content Right Panel */}
      <main style={{ flex: 1, padding: '30px' }}>
        {children}
      </main>
    </div>
  )
}
