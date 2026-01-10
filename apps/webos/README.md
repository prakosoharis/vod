# Alkamus WebOS

TV-optimized web application for Alkamus VOD platform.

## Features

- **Authentication**: Login & Register
- **Home**: Featured carousel, content categories
- **Browse**: Search & filter content
- **Live Streaming**: Real-time live streams
- **Video Player**: HLS.js based player with TV remote controls
- **Profile**: User profile & settings
- **Payment**: Midtrans integration for subscriptions

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand (state management)
- Tailwind CSS
- HLS.js (video streaming)
- Socket.io-client (live streaming)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## TV Controls

The app is optimized for TV navigation:

- **Arrow Keys**: Navigate through content
- **Enter**: Select/Play
- **Esc**: Go back

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://api.mostara.id/api
VITE_SOCKET_URL=https://api.mostara.id
VITE_MIDTRANS_CLIENT_KEY=Mid-client-VMvBYBwPbEvGFUO3
VITE_MIDTRANS_MERCHANT_ID=G136369276
VITE_MIDTRANS_IS_PRODUCTION=false
```

## Project Structure

```
src/
├── components/     # UI components
├── pages/         # Page components
├── hooks/         # Custom hooks
├── services/      # API services
├── stores/        # State management
├── types/         # TypeScript types
├── utils/         # Utility functions
└── styles/        # Global styles
```

## License

MIT
