# Trackwise Frontend

The frontend application for Trackwise, built with React Router v7, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- npm, yarn, or pnpm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api-v1
VITE_FILES_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

## 📦 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run typecheck` - Run TypeScript type checking

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── components/        # Reusable React components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── layout/       # Layout components (Header, Sidebar)
│   │   ├── project/      # Project-related components
│   │   ├── task/         # Task-related components
│   │   ├── workspace/    # Workspace components
│   │   └── ui/         # Reusable UI components (Radix UI)
│   ├── routes/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── dashboard/   # Dashboard pages
│   │   ├── user/        # User profile pages
│   │   └── root/        # Root/home page
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── provider/        # Context providers
│   ├── types/           # TypeScript type definitions
│   └── app.css          # Global styles
├── public/              # Static assets
└── package.json
```

## 🎨 Tech Stack

- **Framework**: React Router v7
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Real-time**: Socket.IO Client

## 🎯 Key Features

- Server-side rendering (SSR) with React Router
- Hot Module Replacement (HMR) for fast development
- Type-safe with TypeScript
- Modern UI with Tailwind CSS
- Responsive design
- Dark/Light theme support
- Real-time updates with Socket.IO

## 📝 Building for Production

```bash
npm run build
```

The build output will be in the `build/` directory:
- `build/client/` - Static assets
- `build/server/` - Server-side code

## 🐳 Docker

See the main [README.md](../README.md) for Docker setup instructions.

## 📖 Documentation

- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Radix UI Docs](https://www.radix-ui.com/)
- [React Query Docs](https://tanstack.com/query/latest)

---

Part of the Trackwise project management application.
