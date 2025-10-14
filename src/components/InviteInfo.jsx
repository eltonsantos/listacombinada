import React from 'react'
import { useEffect, useState } from 'react'
import { getInvitePublicInfo } from '../lib/functions'

export default function InviteInfo({ token }){
  const [loading, setLoading] = useState(!!token)
  const [inviterName, setInviterName] = useState('')
  const [groupName, setGroupName] = useState('')

  useEffect(() => {
    let mounted = true
    async function load(){
      if(!token){ setLoading(false); return }
      try{
        const data = await getInvitePublicInfo(token)
        if(!mounted) return
        setInviterName(data?.inviterName || 'um membro da Lista Combinada')
        setGroupName(data?.groupName || '')
      }catch(e){
        setInviterName('um membro da Lista Combinada')
      }finally{
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [token])

  const title = token
    ? (groupName ? `Você foi convidado(a) para o grupo ${groupName}!` : 'Você foi convidado(a) para um grupo!')
    : 'Venha fazer parte do Lista Combinada'

  return (
    <div className="left">
      <h1>{title}</h1>
      {token ? (
        <p className="muted">Convite enviado por <strong>{loading ? 'carregando...' : inviterName}</strong></p>
      ) : (
        <p className="muted">Crie sua conta gratuita e comece a compartilhar listas em tempo real.</p>
      )}

      <ul className="benefits">
        <li>✅ Crie e compartilhe listas em tempo real com sua família e amigos.</li>
        <li>✅ Marque itens como comprados e veja quem marcou — tudo sincronizado.</li>
        <li>✅ Notificações inteligentes para lembrar do essencial.</li>
        <li>✅ Tema claro/escuro e interface simples, rápida e bonita.</li>
      </ul>

      {token && (
        <div className="app-cta">
          <a className="btn ghost" href={`'${import.meta.env.VITE_APP_SCHEME || 'listacombinada'}://invite/' + token`}>Abrir no app (se já tiver instalado)</a>
        </div>
      )}
    </div>
  )
}
