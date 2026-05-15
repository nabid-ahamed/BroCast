# BroCast - Modern Realtime Collaboration

BroCast is a high-performance, real-time team collaboration platform inspired by Microsoft Teams and Discord. Built with a modern glassmorphism aesthetic using React, Tailwind CSS, and Supabase.

![BroCast Banner](https://images.unsplash.com/photo-1611743526673-9bb880c4821a?auto=format&fit=crop&q=80&w=1200)

## 🚀 Features

- **Real-time Messaging**: Instant message delivery with Supabase Realtime.
- **Direct & Group Chats**: Seamlessly switch between private and team conversations.
- **Presence & Typing**: See who's online and when they're typing.
- **Secure Authentication**: Built-in signup, login, and session persistence.
- **File & Image Sharing**: Integrated storage for media collaboration.
- **Glassmorphism UI**: Stunning, premium dark mode interface.
- **Responsive Design**: Fully optimized for desktop and mobile.
- **Error Resilient**: Robust error boundaries and configuration checks.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS.
- **Animations**: Framer Motion.
- **Backend**: Supabase (Auth, Postgres, Realtime, Storage).
- **Icons**: Lucide React.
- **Date Handling**: date-fns.

## 📦 Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/your-username/BroCast.git
cd BroCast
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://wabrkrjlkafnajcwmyhl.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

### 3. Database Setup
Follow the [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) guide to initialize your database schema, storage buckets, and realtime replication.

### 4. Run Development Server
```bash
npm run dev
```

## 🌐 Deployment

BroCast is deployment-ready for **Vercel** or **Netlify**.

### Vercel / Netlify
1. Connect your GitHub repository.
2. Add the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
3. Set the build command to `npm run build` and output directory to `dist`.

## 📂 Project Structure

```
src/
  components/
    auth/      - Authentication screens
    chat/      - Sidebar, ChatList, MessageList, ChatWindow
    ui/        - Reusable UI (Avatar, Loading, ErrorBoundary)
  hooks/       - useAuth and useChat logic
  lib/         - Supabase client config
  index.css    - Tailwind and global styles
```

---

Built with ❤️ by Nabid Ahamed
