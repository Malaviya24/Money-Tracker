<p align="center">
  <h1 align="center">💰 Tracura</h1>
  <p align="center">
    <strong>Smart expense tracking for modern life</strong>
  </p>
  <p align="center">
    Take control of your finances with intelligent expense management
  </p>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## ✨ Features

- **📊 Expense Spaces** - Organize expenses into customizable spaces (travel, groceries, subscriptions, etc.)
- **📈 Analytics Dashboard** - Visual insights into your spending patterns
- **🎯 Budget Tracking** - Set and monitor budgets with real-time progress indicators
- **🌓 Dark/Light Mode** - Beautiful UI that adapts to your preference
- **📱 Responsive Design** - Seamless experience across desktop and mobile devices
- **🔐 Secure Authentication** - Protected user accounts with Supabase Auth

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Build Tool** | Vite |
| **Backend** | Supabase (Auth, Database, Edge Functions) |
| **State Management** | TanStack Query |
| **Forms** | React Hook Form, Zod |
| **Charts** | Recharts |
| **Routing** | React Router v6 |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tracura
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Sidebar, Header, etc.)
│   └── ui/              # Reusable UI components (shadcn/ui)
├── hooks/               # Custom React hooks
├── integrations/        # Third-party integrations (Supabase)
├── lib/                 # Utility functions
├── pages/               # Page components
└── test/                # Test configuration and utilities
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ using <a href="https://lovable.dev">Lovable</a>
</p>
