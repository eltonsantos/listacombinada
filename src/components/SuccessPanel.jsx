import React from 'react'

export default function SuccessPanel({ message, playUrl, hasToken }){
  return (
    <div className="success">
      <h2>✅ Sucesso! 🎉</h2>
      <p className="success-message">{message}</p>
      
      {hasToken && (
        <p className="highlight">
          Você já faz parte do grupo! 🎊
        </p>
      )}
      
      <a className="btn primary" href={playUrl} target="_blank" rel="noopener noreferrer">
        📱 Baixar na Google Play
      </a>
      
      <p className="muted small">
        Depois de instalar, faça login com o e-mail que você cadastrou.
      </p>
    </div>
  )
}
