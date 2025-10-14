import React from 'react'
import logo from '../assets/logo.png'

export default function Header(){
  return (
    <header className="container py-24">
      <div className="brand">
        <img src={logo} alt="Lista Combinada" className="logo" />
        <span className="brand-name">Lista<span>Combinada</span></span>
      </div>
    </header>
  )
}
