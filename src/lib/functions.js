import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'

export async function getInvitePublicInfo(token){
  try {
    const callable = httpsCallable(functions, 'getInvitePublicInfo')
    const { data } = await callable({ token })
    return data // { inviterName, groupName }
  } catch (error) {
    console.error('Erro ao buscar informações do convite:', error)
    throw error
  }
}

export async function joinByToken(token){
  try {
    const callable = httpsCallable(functions, 'joinByToken')
    const { data } = await callable({ token })
    return data // { groupId }
  } catch (error) {
    console.error('Erro ao entrar no grupo:', error)
    throw error
  }
}
