# Net Worth Tracker

A personal finance tracking application built with Next.js and Supabase.

## Prerequisites

- **Node.js** (v18 or higher)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop) or install via Homebrew: `brew install --cask docker`
- **Supabase CLI** - Install via Homebrew: `brew install supabase/tap/supabase`

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Docker Desktop

Make sure Docker Desktop is running 

### 3. Start Supabase Locally

```bash
supabase start
```

This will:
- Start a local PostgreSQL database
- Apply database migrations
- Start Supabase services (Auth, Storage, etc.)

**Note:** The first time you run this, it may take a few minutes to download Docker images.

### 4. Configure Environment Variables

After running `supabase start`, you'll see connection details. Copy these values to your `.env` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

You can get these values by running:
```bash
supabase status
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Useful Commands

### Supabase

- `supabase start` - Start local Supabase services
- `supabase stop` - Stop local Supabase services
- `supabase status` - Show connection details and service status
- `supabase db reset` - Reset database and re-run migrations

### Database Management

- **Supabase Studio**: http://127.0.0.1:54323 - Visual database editor
- View tables, run queries, and manage data through the web interface

### Development

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server

## Project Structure

- `src/services/` - Database service layer with Server Actions (marked with 'use server')
- `supabase/migrations/` - Database schema migrations
- `src/lib/supabase/` - Supabase client configuration

## Stopping Services

To stop Supabase:
```bash
supabase stop
```

**Note:** Your data persists between stops/starts. Data is only lost if you run `supabase db reset` or delete Docker volumes.
