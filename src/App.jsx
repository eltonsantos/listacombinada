import React from 'react'
import Header from './components/Header.jsx'
import InviteInfo from './components/InviteInfo.jsx'
import AuthPanel from './components/AuthPanel.jsx'
import Footer from './components/Footer.jsx'
import useToken from './hooks/useToken.js'

export default function App(){
  const token = useToken()
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
