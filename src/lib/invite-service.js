import { doc, getDoc, runTransaction, serverTimestamp, increment } from "firebase/firestore";
import { db } from "./firebase";
import { upsertUserDoc } from "./user-store";

/**
 * Carrega informações do convite pelo token
 * @param {string} token - Token do convite
 * @returns {Promise<Object|null>} Dados do convite ou null se inválido
 */
export async function loadInviteInfo(token) {
  try {
    console.log('🔍 Carregando informações do convite:', token);
    
    const inviteRef = doc(db, "invites", token);
    const inviteSnap = await getDoc(inviteRef);
    
    if (!inviteSnap.exists()) {
      console.log('❌ Convite não encontrado');
      throw new Error("Convite não encontrado.");
    }
    
    const inviteData = inviteSnap.data();
    console.log('📋 Dados do convite carregados:', inviteData);
    
    // Validações
    if (inviteData.status !== "active") {
      console.log('❌ Convite inativo:', inviteData.status);
      throw new Error("Convite inativo.");
    }
    
    if (inviteData.expiresAt && inviteData.expiresAt.toDate() < new Date()) {
      console.log('❌ Convite expirado');
      throw new Error("Convite expirado.");
    }
    
    console.log('✅ Convite válido:', {
      groupName: inviteData.groupName,
      inviterName: inviteData.inviterName,
      groupId: inviteData.groupId
    });
    
    return {
      groupId: inviteData.groupId,
      groupName: inviteData.groupName,
      inviterName: inviteData.inviterName,
      inviterId: inviteData.inviterId,
      email: inviteData.email,
      maxUses: inviteData.maxUses,
      uses: inviteData.uses || 0,
      status: inviteData.status
    };
  } catch (error) {
    console.error('❌ Erro ao carregar convite:', error);
    throw error;
  }
}

/**
 * Aceita o convite e adiciona o usuário ao grupo
 * @param {string} token - Token do convite
 * @param {Object} user - Dados do usuário {uid, email, displayName}
 * @returns {Promise<Object>} Resultado da operação
 */
export async function acceptInviteWithToken(token, user) {
  console.log('🎯 Aceitando convite:', { token, user });
  
  return await runTransaction(db, async (tx) => {
    const inviteRef = doc(db, "invites", token);
    const inviteSnap = await tx.get(inviteRef);
    
    if (!inviteSnap.exists()) {
      throw new Error("Convite não encontrado.");
    }
    
    const inviteData = inviteSnap.data();
    
    // Validações do convite
    if (inviteData.status !== "active") {
      throw new Error("Convite inativo.");
    }
    
    if (inviteData.expiresAt && inviteData.expiresAt.toDate() < new Date()) {
      throw new Error("Convite expirado.");
    }
    
    if (inviteData.email && inviteData.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error("Convite restrito a outro e-mail.");
    }
    
    const groupId = inviteData.groupId;
    
    console.log('📝 Criando/atualizando documento do usuário...');
    // Criar/atualizar documento do usuário
    const userRef = doc(db, "users", user.uid);
    tx.set(userRef, {
      email: user.email,
      displayName: user.displayName ?? "",
      currency: "EUR",
      plan: "free",
      createdAt: serverTimestamp(),
    }, { merge: true });
    
    console.log('👥 Adicionando usuário ao grupo...');
    // Adicionar como membro do grupo
    const memberRef = doc(db, "groups", groupId, "members", user.uid);
    tx.set(memberRef, { 
      role: "member", 
      joinedAt: serverTimestamp() 
    }, { merge: true });
    
    // Atalho no usuário (opcional, para facilitar consultas)
    const userGroupRef = doc(db, "users", user.uid, "groups", groupId);
    tx.set(userGroupRef, { 
      name: inviteData.groupName ?? "", 
      role: "member", 
      joinedAt: serverTimestamp() 
    }, { merge: true });
    
    console.log('📊 Atualizando estatísticas do convite...');
    // Atualizar convite
    const nextUses = (inviteData.uses ?? 0) + 1;
    const isMaxUsesReached = inviteData.maxUses && nextUses >= inviteData.maxUses;
    
    tx.update(inviteRef, {
      uses: increment(1),
      lastUsedAt: serverTimestamp(),
      lastUsedBy: user.uid,
      status: isMaxUsesReached ? "used" : "active",
    });
    
    console.log('✅ Convite aceito com sucesso');
    
    return { 
      groupId, 
      groupName: inviteData.groupName, 
      inviterName: inviteData.inviterName 
    };
  });
}
