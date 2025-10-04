# Git Hunters Frontend (React + Vite + Tailwind)

A modern React frontend built with Vite, featuring the same design system as the original Next.js Git Hunters app. Includes beautiful animations with Framer Motion and a complete UI component library with Radix UI.

## Features
- 🎨 **Same Design System**: Identical fonts, colors, layout, and theme as Git Hunters
- ⚡ **Fast & Modern**: Built with Vite for lightning-fast development
- 🎭 **Beautiful Animations**: Framer Motion animations throughout
- 🧩 **Component Library**: Complete UI library with Radix UI primitives
- 📱 **Responsive Design**: Mobile-first responsive layout
- 🌗 **Theme Ready**: Dark/light mode support built-in (CSS variables)
- 🚀 **Performance**: Optimized bundle size and runtime performance

## Pages
- **Landing Page** (`/`) - Beautiful hero with animated cards
- **Developer Dashboard** (`/dev/dashboard`) - Browse issues and manage bounties
- **Organization Dashboard** (`/org/dashboard`) - Manage repositories and bounties
- **Leaderboard** (`/leaderboard`) - Top developers and organizations

## Tech Stack
- **React 18** - Component library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless component primitives
- **Framer Motion** - Animation library
- **Lucide React** - Icon system
- **React Router** - Client-side routing

## Setup & Run

```powershell
cd D:\HackAura\Frontend

# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Notes
- Backend proxy configured for `/api/*` and `/health` routes
- Path aliases configured (`@/` points to `src/`)
- CSS custom properties for theming
- Component library follows shadcn/ui patterns
- All animations are performant and accessible

## Component Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI primitives
│   └── Navbar.jsx    # Navigation component
├── pages/            # Route components
├── lib/
│   └── utils.js      # Utility functions (cn, etc.)
└── App.jsx           # Main app with routing
```
