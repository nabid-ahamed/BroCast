-- 1. Add invite token to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE;

-- 2. Create connections table
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, receiver_id)
);

-- 3. Enable RLS on connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- 4. Policies for connections
DROP POLICY IF EXISTS "Users can view their own connections." ON public.connections;
DROP POLICY IF EXISTS "Users can request connections." ON public.connections;
DROP POLICY IF EXISTS "Users can update their connections." ON public.connections;
DROP POLICY IF EXISTS "Users can delete their connections." ON public.connections;

CREATE POLICY "Users can view their own connections." ON public.connections FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = receiver_id
);

CREATE POLICY "Users can request connections." ON public.connections FOR INSERT WITH CHECK (
  auth.uid() = requester_id
);

CREATE POLICY "Users can update their connections." ON public.connections FOR UPDATE USING (
  auth.uid() = requester_id OR auth.uid() = receiver_id
);

CREATE POLICY "Users can delete their connections." ON public.connections FOR DELETE USING (
  auth.uid() = requester_id OR auth.uid() = receiver_id
);

-- 5. Enable Realtime on connections
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.messages, public.chats, public.profiles, public.connections;
COMMIT;

-- 6. Update function to handle setting an invite token for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_first_user BOOLEAN;
  new_invite_token TEXT;
BEGIN
  -- Check if this is the first user
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;
  
  -- Generate a random 8-character invite token
  new_invite_token := substr(md5(random()::text), 1, 8);

  INSERT INTO public.profiles (id, username, full_name, avatar_url, is_admin, approval_status, invite_token)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    is_first_user, -- First user is admin
    CASE WHEN is_first_user THEN 'approved' ELSE 'pending' END, -- First user is approved
    new_invite_token
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update existing users with an invite token if they don't have one
DO $$
DECLARE
  profile_rec RECORD;
BEGIN
  FOR profile_rec IN SELECT id FROM public.profiles WHERE invite_token IS NULL LOOP
    UPDATE public.profiles SET invite_token = substr(md5(random()::text), 1, 8) WHERE id = profile_rec.id;
  END LOOP;
END $$;
