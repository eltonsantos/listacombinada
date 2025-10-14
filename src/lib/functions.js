import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'

export async function getInvitePublicInfo(token){
  const callable = httpsCallable(functions, 'getInvitePublicInfo')
  const { data } = await callable({ token })
  return data // { inviterName, groupName }
}

export async function joinByToken(token){
  const callable = httpsCallable(functions, 'joinByToken')
  const { data } = await callable({ token })
  return data // { groupId }
}
