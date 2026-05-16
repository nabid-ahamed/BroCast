-- 1. Add is_edited to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

-- 2. Create hidden_messages table to track "Delete for Me"
CREATE TABLE IF NOT EXISTS public.hidden_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);

-- 3. Enable RLS and create policy for hidden_messages
ALTER TABLE public.hidden_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own hidden messages" ON public.hidden_messages;
CREATE POLICY "Users can manage their own hidden messages" ON public.hidden_messages 
FOR ALL USING (auth.uid() = user_id);

-- 4. Force refresh realtime publications to include hidden_messages
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.messages, public.chats, public.profiles, public.connections, public.chat_members, public.hidden_messages;
COMMIT;
