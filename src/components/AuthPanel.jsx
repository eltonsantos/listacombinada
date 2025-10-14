import React, { useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from 'firebase/auth'
import { joinByToken } from '../lib/functions'
import { upsertUserDoc } from '../lib/user-store'
import { loadInviteInfo, acceptInviteWithToken } from '../lib/invite-service'
import SuccessPanel from './SuccessPanel.jsx'

export default function AuthPanel({ token }){
  const [mode, setMode] = useState('signup') // 'signup' | 'success'
  const [status, setStatus] = useState('')
  const [errors, setErrors] = useState({})
  const [playUrl] = useState(import.meta.env.VITE_PLAY_URL || 'https://play.google.com/store/apps')
  
  // Estados para informações do convite
  const [inviteInfo, setInviteInfo] = useState(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState(null)

  // Carregar informações do convite quando há token
  useEffect(() => {
    if (token) {
      setInviteLoading(true)
      setInviteError(null)
      
      loadInviteInfo(token)
        .then(info => {
          setInviteInfo(info)
          setInviteLoading(false)
        })
        .catch(error => {
          console.error('Erro ao carregar convite:', error)
          setInviteError(error.message)
          setInviteLoading(false)
        })
    }
  }, [token])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if(user && token && mode !== 'success'){
        try{
          await joinByToken(token)
          setMode('success')
          setStatus('')
        }catch(e){ /* silencioso */ }
      }
    })
    return () => unsub()
  }, [token, mode])

  function setError(field, msg){
    setErrors(prev => ({ ...prev, [field]: msg }))
  }
  function clearErrors(){ setErrors({}); setStatus('') }

  async function handleSignup(e){
    e.preventDefault()
    clearErrors()
    const name = e.currentTarget.name.value.trim()
    const email = e.currentTarget.email.value.trim()
    const password = e.currentTarget.password.value
    const confirm = e.currentTarget.confirm.value

    if(!name) return setError('name','Informe seu nome')
    if(!email) return setError('email','Informe seu e-mail')
    if(password.length < 6) return setError('password','Mínimo 6 caracteres')
    if(password !== confirm) return setError('confirm','As senhas não coincidem')

    try{
      setStatus('Criando sua conta...')
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      
      if(token){
        // Fluxo com token: usar acceptInviteWithToken
        console.log('🎯 Aceitando convite e adicionando ao grupo...')
        await acceptInviteWithToken(token, {
          uid: cred.user.uid,
          email,
          displayName: name,
        })
        console.log('✅ Convite aceito e usuário adicionado ao grupo')
      } else {
        // Fluxo sem token: apenas persistir no Firestore
        console.log('📝 Persistindo usuário no Firestore...')
        await upsertUserDoc(cred.user.uid, {
          email,
          displayName: name,
          currency: "EUR",
          plan: "free",
        })
        console.log('✅ Usuário persistido com sucesso no Firestore')
      }
      
      setMode('success')
      setStatus('')
    }catch(err){
      console.error('Erro no cadastro:', err)
      if(err?.code === 'auth/email-already-in-use'){
        setError('email','Este e-mail já possui conta. Use outro e-mail ou baixe o app para fazer login.')
        setStatus('')
      }else if(err?.message?.includes('Convite restrito a outro e-mail')){
        setStatus('Este convite é restrito a outro e-mail.')
      }else if(err?.message?.includes('Convite inativo')){
        setStatus('Este convite não está mais ativo.')
      }else if(err?.message?.includes('Convite expirado')){
        setStatus('Este convite expirou.')
      }else if(err?.message?.includes('Convite não encontrado')){
        setStatus('Convite não encontrado ou inválido.')
      }else if(err?.code === 'functions/not-found'){
        setStatus('Convite não encontrado ou expirado.')
      }else if(err?.code === 'functions/unauthenticated'){
        setStatus('Erro de autenticação. Tente novamente.')
      }else{
        setStatus('Erro ao criar conta. Tente novamente.')
      }
    }
  }


  // Se há erro no convite, mostrar mensagem de erro
  if (token && inviteError) {
    return (
      <div className="right">
        <div className="form">
          <h2>Convite Inválido</h2>
          <p className="error-message">{inviteError}</p>
          <p>Verifique se o link do convite está correto ou entre em contato com quem enviou o convite.</p>
        </div>
      </div>
    )
  }

  // Se está carregando informações do convite
  if (token && inviteLoading) {
    return (
      <div className="right">
        <div className="form">
          <h2>Carregando convite...</h2>
          <p>Aguarde enquanto carregamos as informações do seu convite.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="right">
      {mode === 'success' ? (
        <SuccessPanel
          message={token ? 'Pronto! Agora você já faz parte da LISTA COMBINADA!' : 'Conta criada! Agora baixe o Lista Combinada na Play Store.'}
          playUrl={playUrl}
        />
      ) : (
        <form className="form" onSubmit={handleSignup} noValidate>
          {token && inviteInfo ? (
            <>
              <h2>Você foi convidado(a) para o grupo <strong>{inviteInfo.groupName}</strong>!</h2>
              <p>Convite enviado por <strong>{inviteInfo.inviterName}</strong> da Lista Combinada.</p>
            </>
          ) : (
            <h2>Crie sua conta</h2>
          )}

          <div className="field">
            <label htmlFor="name">Nome completo</label>
            <input id="name" name="name" type="text" placeholder="Seu nome" />
            <span className="error">{errors['name'] || ''}</span>
          </div>

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" placeholder="voce@email.com" />
            <span className="error">{errors['email'] || ''}</span>
          </div>

          <div className="field">
            <label htmlFor="password">Senha</label>
            <input id="password" name="password" type="password" placeholder="••••••••" />
            <span className="error">{errors['password'] || ''}</span>
          </div>

          <div className="field">
            <label htmlFor="confirm">Repetir senha</label>
            <input id="confirm" name="confirm" type="password" placeholder="••••••••" />
            <span className="error">{errors['confirm'] || ''}</span>
          </div>

          <button className="btn" type="submit">Criar conta {token ? 'e entrar no grupo' : ''}</button>
          <div className="status">{status}</div>
        </form>
      )}
    </div>
  )
}
