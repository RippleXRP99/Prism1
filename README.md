# PRISM Platform

**Version:** 1.0.0  
**Author:** RippleXRP99  
**Project Status:** Iterative Development - Solid Foundation → Features → Additional Platforms

## Overview

PRISM is a content creator platform with a focus on web-first development. The platform consists of:

- **Consumer Frontend**: End-user interface for content discovery and consumption
- **Creator Studio**: Full-featured web application for content creators
- **API Backend**: Centralized backend services
- **Admin Dashboard**: Platform administration (optional)

## Architecture

This is a monorepo setup with focus on web applications:

```
prism/
├── apps/
│   ├── consumer/           # Consumer frontend (Next.js/React)
│   ├── creator-studio/     # Creator Studio web application
│   └── admin/              # Admin dashboard (optional)
├── packages/
│   ├── api/                # Backend API (Express.js)
│   ├── auth/               # Authentication modules
│   ├── database/           # Database models & interfaces
│   ├── media/              # Media processing
│   ├── streaming/          # Streaming functionality
│   ├── ui/                 # Shared UI components
│   └── utils/              # Shared utilities
└── infrastructure/         # DevOps, Docker, Kubernetes, Terraform
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - API Server: http://localhost:3001
   - Consumer Frontend: http://localhost:3000
   - Creator Studio: http://localhost:3002

## Development Scripts

- `npm run dev` - Start all development servers
- `npm run dev:api` - Start only the API server
- `npm run dev:consumer` - Start only the consumer frontend
- `npm run dev:creator` - Start only the creator studio
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Technology Stack

- **Frontend**: React, Next.js (optional)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt
- **Development**: JavaScript (no TypeScript for simplicity)

## Development Philosophy

1. **Web-first approach**: Primary focus on web applications
2. **Iterative development**: Solid foundation → Core features → Extensions
3. **JavaScript-first**: No TypeScript for faster development and easier customization
4. **Monorepo structure**: Shared code and coordinated development

## Next Steps

1. Set up the backend API with authentication
2. Create the consumer frontend
3. Build the creator studio web application
4. Add media processing and streaming capabilities
5. Implement admin dashboard
6. (Later) Desktop and mobile apps as wrappers

## License

MIT License
