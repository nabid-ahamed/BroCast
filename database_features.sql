-- 1. Add is_unsent to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_unsent BOOLEAN DEFAULT FALSE;

-- 2. Add is_hidden to chat_members to allow soft deleting/hiding a chat from the sidebar
ALTER TABLE public.chat_members ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- 3. Update messages policy to allow users to update their own messages (for unsending)
DROP POLICY IF EXISTS "Users can update their own messages." ON public.messages;
CREATE POLICY "Users can update their own messages." ON public.messages FOR UPDATE USING (
  auth.uid() = user_id
);

-- 4. Update chat_members policy to allow users to update their own membership (for hiding chats)
DROP POLICY IF EXISTS "Users can update their own chat membership." ON public.chat_members;
CREATE POLICY "Users can update their own chat membership." ON public.chat_members FOR UPDATE USING (
  auth.uid() = user_id
);

-- 5. Helper function to check if user can message in a specific chat
CREATE OR REPLACE FUNCTION public.check_can_message(target_chat_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_grp BOOLEAN;
  other_user_id UUID;
  is_connected BOOLEAN;
BEGIN
  -- get chat is_group
  SELECT is_group INTO is_grp FROM public.chats WHERE id = target_chat_id;
  
  IF is_grp THEN
    RETURN TRUE;
  END IF;

  -- for direct messages, find the other member
  SELECT user_id INTO other_user_id FROM public.chat_members WHERE chat_id = target_chat_id AND user_id != target_user_id LIMIT 1;
  
  IF other_user_id IS NULL THEN
    RETURN TRUE;
  END IF;

  -- check if connected
  SELECT EXISTS (
    SELECT 1 FROM public.connections 
    WHERE status = 'accepted' AND 
    ((requester_id = target_user_id AND receiver_id = other_user_id) OR 
     (requester_id = other_user_id AND receiver_id = target_user_id))
  ) INTO is_connected;

  RETURN is_connected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Enforce connection check on message inserts
DROP POLICY IF EXISTS "Members can insert messages in their chats." ON public.messages;
CREATE POLICY "Members can insert messages in their chats." ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  public.check_is_member(chat_id, auth.uid()) AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved') AND
  public.check_can_message(chat_id, auth.uid())
);

-- 7. Trigger to hide direct message chats when a connection is removed
CREATE OR REPLACE FUNCTION public.handle_connection_removed()
RETURNS TRIGGER AS $$
DECLARE
  chat_id_to_hide UUID;
BEGIN
  -- Find the direct message chat between old.requester_id and old.receiver_id
  SELECT c.id INTO chat_id_to_hide
  FROM public.chats c
  JOIN public.chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = OLD.requester_id
  JOIN public.chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = OLD.receiver_id
  WHERE c.is_group = FALSE
  LIMIT 1;

  IF chat_id_to_hide IS NOT NULL THEN
    -- Hide the chat for both users
    UPDATE public.chat_members 
    SET is_hidden = TRUE 
    WHERE chat_id = chat_id_to_hide;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_connection_removed ON public.connections;
CREATE TRIGGER on_connection_removed
  AFTER DELETE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_connection_removed();

-- 8. Force refresh realtime publications
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.messages, public.chats, public.profiles, public.connections, public.chat_members;
COMMIT;
