import React, { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import InviteInfo from './components/InviteInfo.jsx'
import AuthPanel from './components/AuthPanel.jsx'
import Footer from './components/Footer.jsx'
import TokenExpiredPanel from './components/TokenExpiredPanel.jsx'
import useToken from './hooks/useToken.js'
import { getInvitePublicInfo } from './lib/functions.js'

export default function App(){
  const token = useToken()
  // 'loading' | 'valid' | 'expired' | 'not-found' | 'no-token'
  const [tokenStatus, setTokenStatus] = useState(token ? 'loading' : 'no-token')
  const [errorType, setErrorType] = useState(null)
  
  useEffect(() => {
    if (!token) {
      setTokenStatus('no-token')
      return
    }
    
    // Verificar se o token é válido no backend
    getInvitePublicInfo(token)
      .then(() => {
        setTokenStatus('valid')
      })
      .catch((err) => {
        console.error('Erro ao verificar token:', err)
        // Identificar tipo de erro
        if (err?.code === 'functions/deadline-exceeded') {
          setErrorType('deadline-exceeded')
          setTokenStatus('expired')
        } else if (err?.code === 'functions/not-found') {
          setErrorType('not-found')
          setTokenStatus('expired')
        } else {
          // Erro genérico - tratar como não encontrado
          setErrorType('not-found')
          setTokenStatus('expired')
        }
      })
  }, [token])
  
  // Loading state
  if (tokenStatus === 'loading') {
    return (
      <>
        <Header />
        <main className="container">
          <section className="card">
            <div className="loading-panel">
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <p className="muted">Verificando convite...</p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }
  
  // Token expirado ou inválido
  if (tokenStatus === 'expired') {
    return (
      <>
        <Header />
        <main className="container">
          <section className="card">
            <TokenExpiredPanel error={errorType} />
          </section>
        </main>
        <Footer />
      </>
    )
  }
  
  // Fluxo normal (token válido ou sem token)
  return (
    <>
      <Header />
      <main className="container">
        <section className="card grid">
          <InviteInfo token={token} />
          <AuthPanel token={token} />
        </section>
      </main>
      <Footer />
    </>
  )
}
