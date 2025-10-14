# Teste: Cadastro Sem Token - Persistência no Firestore

## Problema Resolvido
- **Antes**: Cadastro sem token não persistia no Firestore
- **Depois**: Cadastro sem token agora cria documento em `users/{uid}` com todos os campos obrigatórios

## Implementações Realizadas

### 1. Configuração do Firestore
- ✅ Adicionado `getFirestore` em `src/lib/firebase.js`
- ✅ Exportado `db` para uso nos serviços

### 2. Função de Persistência
- ✅ Criado `src/lib/user-store.js` com função `upsertUserDoc`
- ✅ Função inclui logs de diagnóstico detalhados
- ✅ Confirmação de persistência com `getDoc` após `setDoc`
- ✅ Tratamento de erros com logs de diagnóstico

### 3. Integração no AuthPanel
- ✅ Modificado `handleSignup` para usar `upsertUserDoc` quando não há token
- ✅ Modificado `handleSignin` para garantir persistência em logins sem token
- ✅ Logs de diagnóstico adicionados em ambos os fluxos

### 4. Regras do Firestore
- ✅ Criado `firestore.rules` com regras atualizadas
- ✅ Permite `create/update/read` em `users/{uid}` quando `request.auth.uid == uid`

## Como Testar

### Teste 1: Cadastro Sem Token
1. Acesse a landing page sem token (ex: `https://seudominio.com/`)
2. Clique em "Criar conta"
3. Preencha o formulário:
   - Nome: "João Silva"
   - Email: "joao@teste.com"
   - Senha: "123456"
   - Confirmar senha: "123456"
4. Clique em "Criar conta"
5. **Verificar no console do navegador**:
   - Deve aparecer: "📝 Persistindo usuário no Firestore..."
   - Deve aparecer: "✅ Usuário persistido com sucesso no Firestore"
6. **Verificar no Firestore Console**:
   - Ir para Firebase Console > Firestore Database
   - Procurar coleção `users`
   - Deve existir documento com UID do usuário
   - Campos obrigatórios: `email`, `displayName`, `currency: "EUR"`, `plan: "free"`, `createdAt`

### Teste 2: Tentativa de Cadastro com Email Existente
1. Tente criar uma conta com o mesmo email do Teste 1
2. **Verificar**: deve mostrar erro "Este e-mail já possui conta. Use outro e-mail ou baixe o app para fazer login."
3. **Verificar**: não deve permitir cadastro duplicado

### Teste 3: Cadastro Com Token
1. Acesse com token (ex: `https://seudominio.com/convite/ABC123`)
2. Faça cadastro normalmente
3. **Verificar**: deve funcionar como antes + persistir no Firestore

### Teste 4: Simulação de Erro
1. Temporariamente quebre as regras do Firestore
2. Tente fazer cadastro
3. **Verificar**: deve mostrar erro claro e não exibir sucesso

## Logs de Diagnóstico

### Logs Esperados no Console:
```
🔄 Iniciando upsertUserDoc: {uid: "abc123", data: {...}}
📝 Tentando escrever no Firestore: {...}
✅ setDoc concluído com sucesso
🔍 Verificando persistência com getDoc...
✅ Documento confirmado no Firestore: {...}
```

### Em Caso de Erro:
```
❌ Erro em upsertUserDoc: [erro]
❌ FALHA: Documento não existe após setDoc
Diagnóstico: {uid, projectId, appName, online, authUid}
```

## Campos do Documento no Firestore

```javascript
{
  email: "usuario@email.com",
  displayName: "Nome do Usuário",
  currency: "EUR",
  plan: "free",
  createdAt: Timestamp // Server timestamp
}
```

## Regras do Firestore Atualizadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow create, update, read: if request.auth != null && request.auth.uid == uid;
    }
    // ... outras regras
  }
}
```

## Próximos Passos

1. **Deploy das regras**: Aplicar `firestore.rules` no Firebase Console
2. **Teste em produção**: Validar funcionamento em ambiente real
3. **Monitoramento**: Acompanhar logs para identificar possíveis problemas
4. **Backup**: Considerar migração de usuários existentes que não têm documento no Firestore
