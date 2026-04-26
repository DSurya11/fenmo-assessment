# ExpenseTracker

A full-stack expense tracking app built with **Next.js 16**, **Supabase**, and **Tailwind CSS v4**.

## Tech Stack

- **Frontend**: Next.js (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes (`app/api/`)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS v4 + inline styles

## Project Structure

```
app/
  layout.tsx           # Root layout
  page.tsx             # Redirect → /login or /dashboard
  login/page.tsx       # Login / signup page
  dashboard/page.tsx   # Main dashboard
  api/
    auth/route.ts      # Auth endpoints (login, signup, logout)
    expenses/route.ts  # CRUD endpoints for expenses
components/
  ExpenseForm.tsx      # Add expense form
  ExpenseList.tsx      # Expenses table
  ExpenseFilters.tsx   # Category filter + sort controls
  Spinner.tsx          # Loading spinner
lib/
  api.ts               # Client-side API helpers + session management
  supabase.ts          # Supabase client initialization
```

## Features

- Email/password authentication (signup & login)
- Add expenses with amount, category, description, and date
- Filter by category and sort by date (newest/oldest)
- Live total calculation
- Responsive design (mobile-first)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase setup

Create an `expenses` table in your Supabase project:

```sql
create table expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  amount numeric not null,
  category text not null,
  description text not null,
  date date not null,
  created_at timestamptz default now()
);

alter table expenses enable row level security;

create policy "Users manage own expenses"
  on expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Method | Route            | Description           |
|--------|------------------|-----------------------|
| POST   | `/api/auth`      | Login or signup        |
| DELETE | `/api/auth`      | Logout                |
| GET    | `/api/expenses`  | List expenses (filtered/sorted) |
| POST   | `/api/expenses`  | Create new expense    |
