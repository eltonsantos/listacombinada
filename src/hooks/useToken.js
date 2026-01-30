// Validar se string é um token válido (32 caracteres alfanuméricos)
function isValidTokenFormat(str) {
  if (!str) return false
  
  // Token deve ter EXATAMENTE 32 caracteres
  if (str.length !== 32) return false
  
  // Token deve conter APENAS letras e números
  const alphanumericOnly = /^[a-zA-Z0-9]+$/
  if (!alphanumericOnly.test(str)) return false
  
  return true
}

export default function useToken(){
  const path = window.location.pathname || '/'
  const pathWithoutSlashes = path.replace(/^\//,'').replace(/\/$/,'')
  
  // Verificar query parameter primeiro (?token=abc)
  const queryToken = new URLSearchParams(window.location.search).get('token')
  if(queryToken) {
    // Validar formato do token do query
    if(!isValidTokenFormat(queryToken)){
      window.location.href = '/'
      return ''
    }
    return queryToken
  }
  
  // Se for rota raiz, não há token
  if(!pathWithoutSlashes) return ''
  
  // Validar formato do token do path
  if(!isValidTokenFormat(pathWithoutSlashes)){
    // Token inválido - redirecionar IMEDIATAMENTE
    window.location.href = '/'
    return ''
  }
  
  // Token válido (32 chars alfanuméricos) - permitir renderização
  return pathWithoutSlashes
}
