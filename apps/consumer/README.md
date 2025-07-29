# PRISM Consumer Frontend

The consumer-facing frontend application where users discover and consume content.

## Features

- **Content Discovery**: Browse and search for videos and creators
- **Video Player**: High-quality video streaming with interactive features
- **User Profiles**: Personal profiles and subscription management
- **Social Features**: Comments, likes, follows, and community interaction
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Development

```bash
# Start development server
npm run dev:consumer

# Or run all services
npm run dev
```

The application will be available at http://localhost:3000

## Structure

```
consumer/
├── index.js          # Express server (will be replaced with React/Next.js)
├── public/           # Static assets
├── components/       # React components (when implemented)
├── pages/           # Page components
├── styles/          # CSS/Styling
└── utils/           # Frontend utilities
```

## Future Implementation

This application will be upgraded to use:
- **React** for component-based UI
- **Next.js** for server-side rendering (optional)
- **State Management** (Context API or simple store)
- **Responsive Design** with mobile-first approach

## API Integration

The frontend will connect to the PRISM API server for:
- User authentication
- Content fetching
- User interactions
- Real-time features

## Deployment

Will be deployed as a static site or SSR application depending on chosen stack.
