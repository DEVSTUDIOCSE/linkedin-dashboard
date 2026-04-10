# Next.js Starter Template

Production-ready Next.js starter with Firebase Auth, AI adapters, and shadcn/ui.

## Quick Start

```bash
# Clone the template
git clone https://github.com/DEVSTUDIOCSE/nextjs-setup.git my-project
cd my-project

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Features

- ⚡ **Next.js 16** with App Router & Turbopack
- 🔥 **Firebase Auth** with protected routes
- 🎨 **shadcn/ui** components + Tailwind CSS v4
- 🤖 **AI Adapters** (Gemini, OpenAI, custom)
- 📱 **PWA Ready** with offline support
- 🌙 **Dark/Light theme** with next-themes
- 📝 **TypeScript** strict mode
- 🧩 **Frontend Design Skill** — Built-in AI coding guidelines (see `.agents/skills/frontend-design/`)

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
3. Enable Authentication (Email/Password, Google, etc.)
4. Add your Firebase config values to `.env.local`

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # React components (ui, auth, layout)
├── contexts/      # React contexts (AuthContext)
├── lib/           # Utilities (firebase, ai, auth)
└── public/        # Static assets
```

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/DEVSTUDIOCSE/nextjs-setup)

## License

MIT
