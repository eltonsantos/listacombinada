import React from 'react'

export default function SuccessPanel({ message, playUrl }){
  return (
    <div className="success">
      <h2>Pronto! 🎉</h2>
      <p>{message}</p>
      <a className="btn" href={playUrl} target="_blank" rel="noopener">Baixar na Google Play</a>
      <p className="muted small">Depois de instalar, faça login com o e-mail que você cadastrou.</p>
    </div>
  )
}
