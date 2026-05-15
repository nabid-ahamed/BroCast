# Supabase Setup for BroCast

Follow these steps to set up the backend for BroCast.

## 1. Project Configuration
- **Project URL**: `https://wabrkrjlkafnajcwmyhl.supabase.co`
- **Project ID**: `wabrkrjlkafnajcwmyhl`

Add these to your `.env` file:
```env
VITE_SUPABASE_URL=https://wabrkrjlkafnajcwmyhl.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 2. Database Schema
Run the following SQL in the Supabase SQL Editor:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'offline',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rooms (Chats) table
CREATE TABLE rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT,
  description TEXT,
  is_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES profiles(id)
);

-- Room Members table
CREATE TABLE room_members (
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Realtime
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table profiles;

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view rooms they are members of." ON rooms FOR SELECT USING (
  EXISTS (SELECT 1 FROM room_members WHERE room_id = rooms.id AND user_id = auth.uid())
);

CREATE POLICY "Members can view messages in their rooms." ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM room_members WHERE room_id = messages.room_id AND user_id = auth.uid())
);

CREATE POLICY "Members can insert messages in their rooms." ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM room_members WHERE room_id = messages.room_id AND user_id = auth.uid())
);
```

## 3. Storage Setup
1. Create a **public** bucket named `chat-assets`.
2. Add the following policies to the bucket:
   - **Select**: Allow all users (Public).
   - **Insert**: Allow authenticated users.
   - **Update/Delete**: Allow users to manage their own files.

## 4. Auth Configuration
1. Go to **Authentication -> Providers**.
2. Ensure **Email** is enabled.
3. (Optional) Disable "Confirm Email" for faster testing.

## 5. Done!
Once the SQL is executed and storage is configured, BroCast is ready to use.
