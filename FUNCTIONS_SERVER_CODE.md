# CÓDIGO DAS FUNCTIONS FIREBASE (SERVIDOR)

## ⚠️ URGENTE: Substitua o código das suas functions Firebase por este:

### Arquivo: functions/src/index.ts (ou .js)

```typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

// ⬇️ NÃO use onRequest para o cliente web; use onCall para evitar CORS manual
export const getInvitePublicInfo = functions.region("us-central1").https.onCall(async (data, context) => {
  const token = String(data?.token || "");
  if (!token) throw new functions.https.HttpsError("invalid-argument", "Token ausente");

  const snap = await db.collection("groupInvites").where("token", "==", token).limit(1).get();
  if (snap.empty) throw new functions.https.HttpsError("not-found", "Convite não encontrado");

  const invite = snap.docs[0].data() as any;
  const groupSnap = await db.collection("groups").doc(invite.groupId).get();
  const groupName = groupSnap.exists ? (groupSnap.data() as any).name : "";

  return {
    inviterName: invite.inviterName || "um membro",
    groupName: groupName || ""
  };
});

export const joinByToken = functions.region("us-central1").https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login necessário");
  const uid = context.auth.uid;
  const token = String(data?.token || "");
  if (!token) throw new functions.https.HttpsError("invalid-argument", "Token ausente");

  const snap = await db.collection("groupInvites").where("token", "==", token).limit(1).get();
  if (snap.empty) throw new functions.https.HttpsError("not-found", "Convite inválido/expirado");
  const ref = snap.docs[0].ref;
  const invite = snap.docs[0].data() as any;

  if (invite.revokedAt) throw new functions.https.HttpsError("failed-precondition", "Convite revogado");
  if (invite.expiresAt && invite.expiresAt.toMillis() < Date.now())
    throw new functions.https.HttpsError("deadline-exceeded", "Convite expirado");

  const memberRef = db.collection("groups").doc(invite.groupId).collection("members").doc(uid);
  await memberRef.set({ role: "member", joinedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

  // consumo/uso do convite (opcional)
  await ref.set({
    usesCount: (invite.usesCount || 0) + 1,
    revokedAt: invite.singleUse ? admin.firestore.FieldValue.serverTimestamp() : invite.revokedAt || null
  }, { merge: true });

  return { groupId: invite.groupId };
});
```

## 🚀 DEPLOY URGENTE:

```bash
cd functions
firebase deploy --only functions
```

## ⚠️ IMPORTANTE:

1. **APAGUE** qualquer versão onRequest com os mesmos nomes
2. **GARANTA** que a região é `us-central1`
3. **USE** apenas `onCall`, nunca `onRequest`
4. **DEPLOY** imediatamente após a alteração

## ✅ RESULTADO ESPERADO:

- ❌ Sem mais erros de CORS
- ✅ Nome do convidador aparece
- ✅ Nome do grupo aparece  
- ✅ Cadastro funciona com token
- ✅ Chamadas vão para `/callable/` (gerenciado pelo SDK)
