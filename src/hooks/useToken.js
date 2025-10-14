export default function useToken(){
  const path = window.location.pathname || '/'
  const raw = path.replace(/^\//,'').replace(/\/$/,'')
  const qs = new URLSearchParams(window.location.search).get('token') || ''
  return raw || qs || ''
}
