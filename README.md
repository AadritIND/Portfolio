# Portfolio - AADRIT's Personal Portfolio Website

![Portfolio Banner](https://img.shields.io/badge/Portfolio-3.2.0-blue?style=flat-square)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3.3-38B2AC?style=flat-square&logo=tailwind-css)

A futuristic, cyberpunk-themed portfolio website showcasing projects, skills, and real-time GitHub activity. Built with cutting-edge web technologies, featuring an interactive terminal with AI capabilities powered by multiple LLM providers.

## Live Demo

[https://aadritind.vercel.app](https://aadritind.vercel.app)

## Features

### 🎨 Design & UI
- **Futuristic Cyberpunk Aesthetic** - Custom retro-tech design with animated elements
- **Custom Cursor** - Interactive cursor effects with context-aware behavior
- **Smooth Animations** - Framer Motion powered animations throughout
- **Dark/Light Mode Elements** - Dynamic theming based on sections
- **Responsive Design** - Optimized for all devices

### 💻 Interactive Terminal
- **AI-Powered Terminal** - Integrated AI assistant with multiple providers
- **Multiple AI Providers** - Support for Groq, OpenRouter, and Google AI Studio
- **Repository Browser** - Browse GitHub repos directly from terminal (`ls`, `cat`, `grep`, `init` commands)
- **Real-time Interaction** - Command execution with animated feedback

### 📊 GitHub Integration
- **Real-time Data** - Live GitHub stats updated from public API
- **Commit Activity Grid** - Superior contribution visualization over last 60 days
- **Auto-updating** - Automatically reflects new repos and commits
- **GitHub Developer Status** - Displays GitHub developer membership
- **Public API Only** - No authentication required, respects rate limits

### 🤖 AI Capabilities
- **Multi-provider Support**: Groq, OpenRouter, Google AI Studio (Gemini)
- **Context-aware Responses** - Integrated into terminal interface
- **Model Switching** - Switch between providers/models on-the-fly
- **Built-in Commands**: `ai <query>`, `aimodel <provider>`, `models`

### ⚡ Performance
- **Lightning Fast** - Built with Vite for optimal performance
- **Type-Safe** - Full TypeScript coverage
- **Optimized Builds** - Code splitting and minification
- **Modern Stack** - React 19, TailwindCSS v4

## Tech Stack

- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Language**: TypeScript 5.8.3
- **Styling**: TailwindCSS 4.3.3
- **Animations**: Framer Motion 12.23.12
- **State Management**: Zustand 5.0.8
- **Routing**: React Router DOM 7.9.1
- **Icons**: Lucide React 0.544.0
- **Effects**: Canvas Confetti 1.9.3

## Quick Start

1. Clone the repository
```bash
git clone https://github.com/AadritIND/Portfolio.git
```

2. Install dependencies
```bash
cd Portfolio
npm install
```

3. Set up environment variables (optional - AI features work with provided keys)
```bash
cp .env.example .env
# Add your API keys if needed
```

4. Run development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

6. Preview production build
```bash
npm run preview
```

## Environment Variables

The project includes pre-configured API keys for AI functionality:

```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
```

## Deployment

Deployed on [Vercel](https://vercel.com) with custom domain: [aadritind.vercel.app](https://aadritind.vercel.app)

## GitHub Stats & Real-time Updates

The portfolio fetches live data from GitHub's public API, ensuring:
- Repository counts stay in sync
- Commit activity is always current
- Stars and stats reflect latest changes
- Works without authentication

## License

This project is open source and available under the [MIT License](LICENSE).

## Connect

- GitHub: [@AadritIND](https://github.com/AadritIND)
- Email: aadritchandravanci23@gmail.com
- Portfolio: [aadritind.vercel.app](https://aadritind.vercel.app)
