# Frontend - React + TypeScript + Vite

Professional, clean, and minimal UI for the Agentic Writing Assistant.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Modern Design** - Clean, minimal, professional UI/UX

## Features

- ✍️ Generate cover letters, motivational letters, social responses, and emails
- 👤 User profile management
- 📊 Quality metrics and assessment display
- 💡 Improvement suggestions
- 📈 Text statistics (word count, pages, etc.)
- 🔄 Real-time API health monitoring
- 🎨 Clean, modern, responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

## Development

1. **Start the backend server first:**
```bash
cd ../backend
python -m uvicorn src.main:app --reload
```

2. **Start the frontend dev server:**
```bash
npm run dev
```

3. **Open your browser:**
   - The app will be available at `http://localhost:5173` (Vite default port)

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   └── api.ts          # API client functions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles with Tailwind
├── public/                 # Static assets
├── index.html              # HTML template
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies and scripts
```

## Configuration

The frontend connects to the API at `http://localhost:8000/api/v1` by default.

To change the API URL, edit `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

## Design Principles

- **Minimal**: Clean interface without clutter
- **Professional**: Modern design suitable for business use
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessible**: Follows WCAG guidelines
- **Fast**: Optimized for performance with Vite
