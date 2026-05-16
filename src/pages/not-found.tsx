import React from "react"

export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh', 
      fontFamily: 'sans-serif',
      color: '#fff',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', color: '#e50914' }}>404</h1>
      <p style={{ fontSize: '1.2rem', color: '#aaa' }}>This page couldn't be found.</p>
      <a href="/" style={{ 
        marginTop: '20px', 
        color: '#fff', 
        textDecoration: 'underline',
        fontSize: '1rem' 
      }}>
        Return to Dashboard
      </a>
    </div>
  )
}
