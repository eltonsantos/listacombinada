import React from 'react'
import logo from '../assets/logo.png'

export default function TokenExpiredPanel({ error }) {
  // Mensagens diferentes baseadas no tipo de erro
  const isExpired = error === 'deadline-exceeded'
  
  const title = isExpired ? 'Convite Expirado' : 'Convite Inválido'
  const message = isExpired 
    ? 'Este link de convite expirou e não é mais válido.'
    : 'Este link de convite não foi encontrado ou já foi utilizado.'

  return (
    <div className="expired-panel">
      <div className="expired-content">
        <img src={logo} alt="Lista Combinada" className="expired-logo" />
        <div className="expired-icon">{isExpired ? '⏰' : '❌'}</div>
        <h2>{title}</h2>
        <p className="expired-message">{message}</p>
        <p className="muted">
          Peça um novo convite para a pessoa que te convidou.
        </p>
        <a className="btn primary" href="/">
          Voltar ao Início
        </a>
      </div>
    </div>
  )
}
