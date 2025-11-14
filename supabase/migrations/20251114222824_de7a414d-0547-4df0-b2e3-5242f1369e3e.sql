-- Aggiorna la tabella shifts per supportare i diversi tipi di moduli
-- Aggiungiamo campi specifici per i vari tipi di moduli

-- Prima aggiungiamo le colonne necessarie
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS module_type text;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS managed_by jsonb;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS intervention_type text;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS vehicle_used text;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS operators_out jsonb;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS operators_back jsonb;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS coordinator jsonb;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS negotiator jsonb;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS operators_involved jsonb;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS activation_time text;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS deactivation_time text;

-- Aggiungiamo commenti per documentare i campi
COMMENT ON COLUMN public.shifts.module_type IS 'Tipo di modulo: patrol_activation, patrol_deactivation, heist_activation, heist_deactivation';
COMMENT ON COLUMN public.shifts.managed_by IS 'Gestito da (solo per attivazione pattugliamento) - max 1 operatore';
COMMENT ON COLUMN public.shifts.intervention_type IS 'Tipo di intervento';
COMMENT ON COLUMN public.shifts.vehicle_used IS 'Veicolo utilizzato: Jeep Cherokee o Land Rover Defender';
COMMENT ON COLUMN public.shifts.operators_out IS 'Operatori in uscita - max 2';
COMMENT ON COLUMN public.shifts.operators_back IS 'Operatori in rientro';
COMMENT ON COLUMN public.shifts.coordinator IS 'Coordinatore (solo per grandi rapine) - max 1';
COMMENT ON COLUMN public.shifts.negotiator IS 'Contrattatore (solo per grandi rapine) - max 1';
COMMENT ON COLUMN public.shifts.operators_involved IS 'Operatori coinvolti (grandi rapine) - min 6, max 15';
COMMENT ON COLUMN public.shifts.activation_time IS 'Orario di attivazione';
COMMENT ON COLUMN public.shifts.deactivation_time IS 'Orario di disattivazione';