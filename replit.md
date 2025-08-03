# Overview

This is a full-stack web application for managing demographic data (DataKependudukan) with an admin dashboard. The application provides comprehensive user management, document handling, activity monitoring, and notification systems. Built with a modern React frontend and Express.js backend, it uses PostgreSQL for data persistence and integrates with Replit's authentication system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect (OIDC) integration
- **Session Management**: Express sessions with PostgreSQL store using connect-pg-simple
- **File Upload**: Multer middleware for handling multipart form data
- **Build System**: ESBuild for server-side bundling

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Core Tables**:
  - Users table with role-based access control and quota management
  - Documents table with file metadata, status tracking, and categorization
  - Activities table for audit logging and user action tracking
  - Requests table for managing approval workflows
  - Notifications table for user communication
  - Sessions table for authentication state persistence

## Authentication & Authorization
- **Identity Provider**: Replit OIDC for seamless integration with Replit environment
- **Session Strategy**: Server-side sessions stored in PostgreSQL
- **Access Control**: Role-based permissions with user status management
- **Security**: HTTP-only cookies with secure flags for production

## File Management
- **Upload Strategy**: Local file storage with configurable size limits (10MB default)
- **File Processing**: Metadata extraction and validation before storage
- **Security**: File type validation and sanitized storage paths

## API Design
- **Architecture**: RESTful API with consistent error handling
- **Data Validation**: Zod schemas shared between client and server
- **Error Handling**: Centralized error middleware with structured responses
- **Logging**: Request/response logging with performance metrics

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection driver optimized for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/**: Comprehensive UI component primitives
- **tailwindcss**: Utility-first CSS framework

## Authentication
- **openid-client**: OIDC client implementation for Replit Auth integration
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store

## Development Tools
- **tsx**: TypeScript execution for development
- **vite**: Frontend build tool and dev server
- **esbuild**: Production server bundling
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

## UI & Styling
- **class-variance-authority**: Component variant management
- **clsx**: Conditional class name utility
- **tailwind-merge**: Tailwind class conflict resolution
- **lucide-react**: Icon library

## Form & Validation
- **react-hook-form**: Form state management
- **zod**: Runtime type validation
- **@hookform/resolvers**: Form validation integration

## File Handling
- **multer**: Multipart form data processing
- **@types/multer**: TypeScript definitions for file uploads