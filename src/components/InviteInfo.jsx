import React, { useEffect, useState } from 'react'
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
        setInviterName(data?.inviterName || 'um membro')
        setGroupName(data?.groupName || '')
      }catch(e){
        console.error('Token inválido ou não encontrado:', e)
        // Token inválido - redirecionar para home
        if(mounted){
          window.location.href = '/'
        }
        return
      }finally{
        if(mounted){
          setLoading(false)
        }
      }
    }
    load()
    return () => { mounted = false }
  }, [token])

  // Determinar título e subtítulo baseado na presença do token
  const title = token
    ? groupName 
      ? `Você foi convidado(a) para o grupo ${groupName}!`
      : 'Você foi convidado(a) para um grupo!'
    : 'Crie grupos e convide seus amigos!'

  const subtitle = token
    ? `Convite enviado por ${loading ? 'carregando...' : inviterName} da Lista Combinada`
    : 'Faça parte da Lista Combinada'

  return (
    <div className="left">
      <h1>{title}</h1>
      <p className="muted">{subtitle}</p>

      <ul className="benefits">
        <li>✅ Crie e compartilhe listas em tempo real com sua família e amigos.</li>
        <li>✅ Marque itens como comprados e veja quem marcou — tudo sincronizado.</li>
        <li>✅ Notificações inteligentes para lembrar do essencial.</li>
        <li>✅ Tema claro/escuro e interface simples, rápida e bonita.</li>
      </ul>

      {token && (
        <div className="app-cta">
          <a className="btn ghost" href={`${import.meta.env.VITE_APP_SCHEME || 'listacombinada'}://invite/${token}`}>Abrir no app (se já tiver instalado)</a>
        </div>
      )}
    </div>
  )
}
