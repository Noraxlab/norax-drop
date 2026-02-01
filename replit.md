# FileShare - Secure File Sharing Platform

## Overview

FileShare is a multi-step file verification and sharing platform. Users access download links through a gated process involving multiple verification steps (landing, scroll verification, security check, and download). An admin panel allows management of links and ad placements.

The application uses a React frontend with a Node.js/Express backend, PostgreSQL for data persistence, and supports ad injection at various points in the user flow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and UI effects
- **Build Tool**: Vite with hot module replacement

The frontend follows a multi-step verification flow:
1. Step1Landing - Initial landing with session initialization
2. Step2Scroll - Scroll-based verification
3. Step3Verify - Security verification
4. Step4Download - Final download access

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **Language**: TypeScript with tsx for development
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schema validation
- **Session Management**: In-memory storage (MemStorage class) with PostgreSQL-ready schema

Key API patterns:
- Public routes for session initialization and step verification
- Admin routes protected by simple password authentication
- Shared route definitions between frontend and backend for type safety

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Tables**:
  - `links` - Stores shareable file links with view counts
  - `sessions` - Tracks user verification progress with expiration
  - `ads` - Configurable ad placements for monetization

The storage layer uses an interface pattern (`IStorage`) allowing easy switching between in-memory and database implementations.

### Build System
- **Client**: Vite builds to `dist/public`
- **Server**: esbuild bundles to `dist/index.cjs`
- **Shared Code**: TypeScript path aliases (`@/`, `@shared/`) resolve client and shared modules

## External Dependencies

### Third-Party Services
- **Firebase**: SDK initialized for future auth/database integration (currently optional, config via environment variables)
- **Firebase Hosting**: Configured in `firebase.json` for static deployment

### Database
- **PostgreSQL**: Required for production (DATABASE_URL environment variable)
- **Drizzle Kit**: Schema migrations via `npm run db:push`

### Key NPM Packages
- `@tanstack/react-query` - Data fetching and caching
- `drizzle-orm` / `drizzle-zod` - Database ORM with Zod integration
- `framer-motion` - Animation library
- `zod` - Runtime type validation
- Full shadcn/ui Radix component set

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required for database operations)
- `VITE_FIREBASE_*` - Firebase configuration (optional)