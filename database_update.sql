-- Run this script in your Supabase SQL Editor to add the pending_username column

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pending_username TEXT;

-- Update the handle_new_user trigger to also handle pending_username if needed (optional, keeping it simple for now)
