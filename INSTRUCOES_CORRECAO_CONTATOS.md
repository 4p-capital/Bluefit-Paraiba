# 🔧 INSTRUÇÕES PARA CORRIGIR O PROBLEMA DE CRIAÇÃO DE CONTATOS

## ❌ Problema Identificado

O sistema está crashando ao criar contatos porque a **estrutura da tabela `contacts` no Supabase está desatualizada**.

O backend está tentando inserir as colunas:
- `wa_id` (WhatsApp ID - apenas números)
- `phone_e164` (formato E.164 com +)
- `first_name` (nome)
- `last_name` (sobrenome)  
- `unit_id` (ID da unidade)
- `situation` (situação do contato)

Mas a tabela `contacts` no banco ainda tem a estrutura antiga:
- `phone_number` (antiga coluna)
- Faltando: `wa_id`, `first_name`, `last_name`, `unit_id`, `situation`

---

## ✅ SOLUÇÃO: Executar Script SQL

### **📋 PASSO A PASSO:**

#### **1️⃣ Abrir SQL Editor no Supabase**
1. Acesse seu projeto no Supabase: https://supabase.com/dashboard
2. No menu lateral, clique em **"SQL Editor"**
3. Clique em **"New query"**

#### **2️⃣ Copiar e Colar o Script**
1. Abra o arquivo **`FIX_CONTACTS_TABLE.sql`** (criado na raiz do projeto)
2. Copie **TODO** o conteúdo do arquivo
3. Cole no SQL Editor do Supabase

#### **3️⃣ Executar o Script**
1. Clique no botão **"RUN"** (ou pressione Ctrl+Enter)
2. Aguarde a execução (deve levar alguns segundos)
3. Verifique os resultados no console:
   - ✅ Deve aparecer: "Script executado com sucesso!"
   - ✅ Deve mostrar a estrutura da tabela ANTES e DEPOIS

#### **4️⃣ Verificar Estrutura da Tabela**
O script deve mostrar a estrutura final com as colunas:
```
✅ wa_id (text)
✅ phone_e164 (text)
✅ display_name (text)
✅ first_name (text)
✅ last_name (text)
✅ unit_id (uuid)
✅ situation (text)
✅ created_at (timestamp)
✅ updated_at (timestamp)
```

---

## 🚀 O QUE O SCRIPT FAZ

1. ✅ **Adiciona coluna `wa_id`** - Armazena apenas números do WhatsApp (ex: 5561987654321)
2. ✅ **Renomeia `phone_number` para `phone_e164`** - Formato internacional com + (ex: +5561987654321)
3. ✅ **Adiciona `first_name` e `last_name`** - Nome e sobrenome separados
4. ✅ **Adiciona `unit_id`** - Referência à unidade (foreign key para `units`)
5. ✅ **Adiciona `situation`** - Situação do contato (Lead, Cliente, etc)
6. ✅ **Remove constraint UNIQUE antiga** - De `phone_number`
7. ✅ **Adiciona constraint UNIQUE em `wa_id`** - Não permite WhatsApp duplicado
8. ✅ **Cria trigger para `display_name`** - Gera automaticamente a partir de `first_name + last_name`
9. ✅ **Atualiza registros existentes** - Preenche `display_name` para contatos antigos

---

## 🧪 TESTAR APÓS EXECUTAR O SCRIPT

### **1️⃣ Voltar para o Blue Desk**
Após executar o script, volte para a aplicação Blue Desk

### **2️⃣ Criar um Contato**
1. Clique em **"Novo"** no módulo de conversas
2. Preencha os dados:
   - WhatsApp: `(61) 98765-4321`
   - Nome: `João`
   - Sobrenome: `Silva`
   - Selecione uma unidade
   - Selecione uma situação (ex: Lead)
3. Clique em **"Criar"**

### **3️⃣ Verificar Resultado**
- ✅ Toast de sucesso deve aparecer
- ✅ Dialog fecha
- ✅ **Lista atualiza SUAVEMENTE (sem crash!)**
- ✅ Nova conversa aparece na lista
- ✅ Nome completo aparece: "João Silva"

---

## 🔍 LOGS ESPERADOS NO CONSOLE

Após executar o script e criar um contato, você deve ver no console do navegador:

```
✅ Token válido! Usuário: teste@hotmail.com
WhatsApp limpo: 5561987654321
wa_id: 5561987654321
phone_e164: +5561987654321
Situação mapeada: Lead
✅ Unidade encontrada: Asa Sul
✅ Contato criado: [ID do contato]
✅ Conversation criada: [ID da conversa]
```

---

## ⚠️ IMPORTANTE

- **NÃO PULE NENHUM PASSO** - Execute o script SQL primeiro!
- **VERIFIQUE OS LOGS** - Se ainda der erro, me mande os logs do console
- **BACKUP OPCIONAL** - Se quiser, faça backup da tabela contacts antes:
  ```sql
  CREATE TABLE contacts_backup AS SELECT * FROM contacts;
  ```

---

## 📞 PRECISA DE AJUDA?

Se após executar o script ainda houver problemas:
1. Tire um print dos logs do SQL Editor
2. Tire um print dos logs do console do navegador
3. Me mande as imagens e eu ajudo a debugar!

---

**🎯 Depois de executar o script, o sistema vai funcionar perfeitamente!** 🚀
