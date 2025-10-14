import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Cria ou atualiza o documento do usuário no Firestore
 * @param {string} uid - ID do usuário
 * @param {Object} data - Dados do usuário {email, displayName, currency?, plan?}
 * @returns {Promise<Object>} Dados persistidos no Firestore
 */
export async function upsertUserDoc(uid, data) {
  console.log('🔄 Iniciando upsertUserDoc:', { uid, data });
  
  const ref = doc(db, "users", uid);
  
  try {
    // Logs de diagnóstico
    console.log('📝 Tentando escrever no Firestore:', {
      collection: 'users',
      docId: uid,
      data: {
        email: data.email,
        displayName: data.displayName ?? "",
        currency: data.currency ?? "EUR",
        plan: data.plan ?? "free",
        createdAt: 'serverTimestamp'
      }
    });

    await setDoc(
      ref,
      {
        email: data.email,
        displayName: data.displayName ?? "",
        currency: data.currency ?? "EUR",
        plan: data.plan ?? "free",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log('✅ setDoc concluído com sucesso');

    // Confirmação de persistência (defensivo)
    console.log('🔍 Verificando persistência com getDoc...');
    const snap = await getDoc(ref);
    
    if (!snap.exists()) {
      console.error('❌ FALHA: Documento não existe após setDoc');
      console.error('Diagnóstico:', {
        uid,
        projectId: db.app.options.projectId,
        appName: db.app.name,
        online: navigator.onLine,
        authUid: db.app.auth()?.currentUser?.uid
      });
      throw new Error("Falha ao persistir users/{uid} no Firestore.");
    }

    const persistedData = snap.data();
    console.log('✅ Documento confirmado no Firestore:', persistedData);
    
    return persistedData;
  } catch (error) {
    console.error('❌ Erro em upsertUserDoc:', error);
    console.error('Diagnóstico adicional:', {
      uid,
      projectId: db.app.options.projectId,
      appName: db.app.name,
      online: navigator.onLine,
      errorCode: error.code,
      errorMessage: error.message
    });
    throw error;
  }
}
