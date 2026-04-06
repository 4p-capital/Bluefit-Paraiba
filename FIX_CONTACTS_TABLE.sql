-- ========================================
-- SCRIPT PARA CORRIGIR ESTRUTURA DA TABELA CONTACTS
-- ========================================
-- Este script adiciona as colunas necessárias que estão sendo usadas
-- pelo backend mas não existem na tabela contacts
-- Execute este script no SQL Editor do Supabase

-- 1️⃣ Verificar estrutura atual
SELECT 'Estrutura ANTES das alterações:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contacts'
ORDER BY ordinal_position;

-- 2️⃣ Adicionar coluna wa_id (WhatsApp ID - apenas números)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'wa_id'
  ) THEN
    ALTER TABLE contacts ADD COLUMN wa_id TEXT;
    RAISE NOTICE 'Coluna wa_id adicionada';
  ELSE
    RAISE NOTICE 'Coluna wa_id já existe';
  END IF;
END $$;

-- 3️⃣ Adicionar coluna phone_e164 (se não existir ou renomear phone_number)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'phone_e164'
  ) THEN
    -- Se phone_number existe, renomear para phone_e164
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'contacts' AND column_name = 'phone_number'
    ) THEN
      ALTER TABLE contacts RENAME COLUMN phone_number TO phone_e164;
      RAISE NOTICE 'Coluna phone_number renomeada para phone_e164';
    ELSE
      ALTER TABLE contacts ADD COLUMN phone_e164 TEXT;
      RAISE NOTICE 'Coluna phone_e164 adicionada';
    END IF;
  ELSE
    RAISE NOTICE 'Coluna phone_e164 já existe';
  END IF;
END $$;

-- 4️⃣ Adicionar coluna first_name (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE contacts ADD COLUMN first_name TEXT;
    RAISE NOTICE 'Coluna first_name adicionada';
  ELSE
    RAISE NOTICE 'Coluna first_name já existe';
  END IF;
END $$;

-- 5️⃣ Adicionar coluna last_name (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE contacts ADD COLUMN last_name TEXT;
    RAISE NOTICE 'Coluna last_name adicionada';
  ELSE
    RAISE NOTICE 'Coluna last_name já existe';
  END IF;
END $$;

-- 6️⃣ Adicionar coluna unit_id (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'unit_id'
  ) THEN
    ALTER TABLE contacts ADD COLUMN unit_id UUID REFERENCES units(id);
    RAISE NOTICE 'Coluna unit_id adicionada';
  ELSE
    RAISE NOTICE 'Coluna unit_id já existe';
  END IF;
END $$;

-- 7️⃣ Adicionar coluna situation (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'situation'
  ) THEN
    ALTER TABLE contacts ADD COLUMN situation TEXT DEFAULT 'Lead';
    RAISE NOTICE 'Coluna situation adicionada';
  ELSE
    RAISE NOTICE 'Coluna situation já existe';
  END IF;
END $$;

-- 8️⃣ Remover constraint UNIQUE de phone_number/phone_e164 (se existir)
-- Vamos criar UNIQUE em wa_id ao invés
DO $$
BEGIN
  -- Remover constraint antiga se existir
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contacts_phone_number_key'
  ) THEN
    ALTER TABLE contacts DROP CONSTRAINT contacts_phone_number_key;
    RAISE NOTICE 'Constraint contacts_phone_number_key removida';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contacts_phone_e164_key'
  ) THEN
    ALTER TABLE contacts DROP CONSTRAINT contacts_phone_e164_key;
    RAISE NOTICE 'Constraint contacts_phone_e164_key removida';
  END IF;
END $$;

-- 9️⃣ Adicionar UNIQUE constraint em wa_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contacts_wa_id_key'
  ) THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_wa_id_key UNIQUE (wa_id);
    RAISE NOTICE 'Constraint UNIQUE adicionada em wa_id';
  ELSE
    RAISE NOTICE 'Constraint UNIQUE em wa_id já existe';
  END IF;
END $$;

-- 🔟 Atualizar display_name para ser gerado automaticamente (trigger)
-- Se first_name e last_name existirem, display_name = "first_name last_name"
CREATE OR REPLACE FUNCTION update_contact_display_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN
    NEW.display_name := NEW.first_name || ' ' || NEW.last_name;
  ELSIF NEW.first_name IS NOT NULL THEN
    NEW.display_name := NEW.first_name;
  ELSIF NEW.last_name IS NOT NULL THEN
    NEW.display_name := NEW.last_name;
  ELSIF NEW.display_name IS NULL THEN
    NEW.display_name := NEW.phone_e164;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_contact_display_name ON contacts;
CREATE TRIGGER trigger_update_contact_display_name
  BEFORE INSERT OR UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_display_name();

-- 1️⃣1️⃣ Atualizar registros existentes com display_name NULL
UPDATE contacts 
SET display_name = COALESCE(
  CASE 
    WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN first_name || ' ' || last_name
    WHEN first_name IS NOT NULL THEN first_name
    WHEN last_name IS NOT NULL THEN last_name
    ELSE phone_e164
  END,
  phone_e164
)
WHERE display_name IS NULL;

-- 1️⃣2️⃣ Verificar estrutura final
SELECT 'Estrutura DEPOIS das alterações:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contacts'
ORDER BY ordinal_position;

-- 1️⃣3️⃣ Verificar constraints
SELECT 'Constraints da tabela contacts:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'contacts'::regclass;

SELECT '✅ Script executado com sucesso!' as resultado;
