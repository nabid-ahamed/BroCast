-- 1. Create Tables (Idempotent)

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'offline',
  approval_status TEXT DEFAULT 'pending', -- pending, approved, rejected
  is_admin BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure columns exist if table was created earlier
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  description TEXT,
  is_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.chat_members (
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enable Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.messages, public.chats, public.profiles;
COMMIT;

-- 3. Functions (Idempotent)
CREATE OR REPLACE FUNCTION public.check_is_member(target_chat_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.chat_members
    WHERE chat_id = target_chat_id AND user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update any profile." ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Chats Policies
DROP POLICY IF EXISTS "Users can view chats they are members of or created." ON public.chats;
DROP POLICY IF EXISTS "Users can view chats they are members of." ON public.chats;
DROP POLICY IF EXISTS "Users can create chats." ON public.chats;
CREATE POLICY "Users can view chats they are members of or created." ON public.chats FOR SELECT USING (
  created_by = auth.uid() OR
  public.check_is_member(id, auth.uid())
);
CREATE POLICY "Users can create chats." ON public.chats FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved')
  AND auth.uid() = created_by
);

-- Chat Members Policies
DROP POLICY IF EXISTS "Members can view fellow members." ON public.chat_members;
DROP POLICY IF EXISTS "Users can join chats (if invited/public)." ON public.chat_members;
DROP POLICY IF EXISTS "Users can add members to chats." ON public.chat_members;
CREATE POLICY "Members can view fellow members." ON public.chat_members FOR SELECT USING (
  public.check_is_member(chat_id, auth.uid())
);
CREATE POLICY "Users can add members to chats." ON public.chat_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved') AND
  (EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND created_by = auth.uid()) OR auth.uid() = user_id)
);

-- Messages Policies
DROP POLICY IF EXISTS "Members can view messages in their chats." ON public.messages;
DROP POLICY IF EXISTS "Members can insert messages in their chats." ON public.messages;
CREATE POLICY "Members can view messages in their chats." ON public.messages FOR SELECT USING (
  public.check_is_member(chat_id, auth.uid())
);
CREATE POLICY "Members can insert messages in their chats." ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  public.check_is_member(chat_id, auth.uid()) AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved')
);

-- 5. Automatic Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_first_user BOOLEAN;
BEGIN
  -- Check if this is the first user
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;

  INSERT INTO public.profiles (id, username, full_name, avatar_url, is_admin, approval_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    is_first_user, -- First user is admin
    CASE WHEN is_first_user THEN 'approved' ELSE 'pending' END -- First user is approved
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Storage Buckets (Policies)
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-assets', 'chat-assets', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'chat-assets');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE USING (bucket_id = 'chat-assets' AND auth.uid() = owner);
