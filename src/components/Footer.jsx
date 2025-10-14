import React from 'react'

export default function Footer(){
  return (
    <footer className="container py-24 footer">
      <p className="muted small">© <span>{new Date().getFullYear()}</span> Lista Combinada — Todos os direitos reservados.</p>
    </footer>
  )
}
