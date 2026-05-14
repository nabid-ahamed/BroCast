# BroCast - Microsoft Teams Style Chat Application 🚀

BroCast is a modern, real-time chat application inspired by the Microsoft Teams interface. Built with React and powered by Chat Engine, it offers a seamless communication experience with a premium look and feel.

![Preview](https://raw.githubusercontent.com/nabid-ahamed/BroCast/main/preview.png) *(Note: Add a screenshot of your app here)*

## ✨ Features

- **Real-time Messaging**: Instant message delivery and updates.
- **Secure Authentication**: Integrated login system with Chat Engine backend.
- **Premium UI/UX**: Microsoft Teams-inspired design with smooth animations using Framer Motion.
- **Responsive Layout**: Works beautifully on desktops, tablets, and mobile devices.
- **Rich Media Support**: Send photos, files, and more (supported via Chat Engine).
- **Customizable**: Built with modular components for easy extension.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Framer Motion, Lucide React.
- **Styling**: CSS Modules / Vanilla CSS.
- **Backend**: Node.js, Express, Axios.
- **Infrastructure**: [Chat Engine](https://chatengine.io/) for real-time messaging and user management.

## 🚀 Getting Started

### Prerequisites

- Node.js installed on your machine.
- A [Chat Engine](https://chatengine.io/) account.

### 1. Clone the repository

```bash
git clone https://github.com/nabid-ahamed/BroCast.git
cd BroCast/teams-chat
```

### 2. Set up Environment Variables

You need to create `.env` files for both the frontend and backend.

#### Frontend (`teams-chat/.env`)
```env
VITE_CHAT_ENGINE_PROJECT_ID=your_project_id_here
```

#### Backend (`teams-chat/backend/.env`)
```env
CHAT_ENGINE_PRIVATE_KEY=your_private_key_here
```

### 3. Install Dependencies

**For Frontend:**
```bash
npm install
```

**For Backend:**
```bash
cd backend
npm install
cd ..
```

### 4. Run the Application

You'll need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

The app should now be running at `http://localhost:5173` (or your Vite default port).

## 📂 Project Structure

```text
teams-chat/
├── backend/            # Express server for authentication
├── src/
│   ├── assets/         # Static images and styles
│   ├── AuthPage.jsx    # Login/Landing screen
│   ├── ChatsPage.jsx   # Main chat dashboard
│   ├── App.jsx         # Main application logic
│   └── main.jsx        # Entry point
├── .env                # Frontend env variables
├── package.json        # Project dependencies
└── vite.config.js      # Vite configuration
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [Nabid Ahamed](https://github.com/nabid-ahamed)
