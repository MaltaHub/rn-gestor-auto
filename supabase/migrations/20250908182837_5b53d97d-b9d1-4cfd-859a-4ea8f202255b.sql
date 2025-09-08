-- Add order and cover photo functionality to vehicle photos
-- This allows photos to be ordered and one to be set as cover for the showcase

-- Add order column to track photo sequence
ALTER TABLE storage.objects 
ADD COLUMN IF NOT EXISTS metadata_order INTEGER DEFAULT 0;

-- Add cover photo tracking in vehicles table
ALTER TABLE public.veiculos_loja 
ADD COLUMN IF NOT EXISTS foto_capa TEXT;