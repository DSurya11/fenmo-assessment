# Fenmo Assessment

This codebase is now split into:

- Frontend: Next.js app in the repository root.
- Backend: Express API in `backend/`.

## Project Structure

```
fenmo-assessment/
	app/                 # Next.js frontend routes/pages
	components/          # Frontend UI components
	lib/                 # Frontend utilities and API client
	backend/
		src/
			routes/          # Backend API route handlers
			server.ts        # Express entrypoint
```

## Environment Variables

Frontend (`.env.local` in root):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Backend (`backend/.env`):

```
PORT=4000
CORS_ORIGIN=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

You can copy `backend/.env.example` to `backend/.env` and fill the values.

## Install Dependencies

Install root (frontend + workspace scripts):

```bash
npm install
```

Install backend dependencies:

```bash
npm --prefix backend install
```

## Run Locally

Run both frontend and backend together:

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:frontend
npm run dev:backend
```

Frontend: http://localhost:3000

Backend health: http://localhost:4000/health
