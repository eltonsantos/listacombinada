export default function useToken(){
  const path = window.location.pathname || '/'
  const pathWithoutSlashes = path.replace(/^\//,'').replace(/\/$/,'')
  
  // Verificar query parameter primeiro (?token=abc)
  const queryToken = new URLSearchParams(window.location.search).get('token')
  if(queryToken) return queryToken
  
  // Se for rota raiz, não há token
  if(!pathWithoutSlashes) return ''
  
  // Qualquer outro path é tratado como potencial token
  // A validação real será feita pelo backend
  return pathWithoutSlashes
}
