# ExpenseTracker

A production-ready full-stack expense tracking application.

**Live Demo:** https://fenmo-assessment-hazel.vercel.app
**Repo:** https://github.com/DSurya11/fenmo-assessment

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Database:** Supabase (PostgreSQL)
- **Validation:** Zod
- **Auth:** Supabase Auth
- **Deployment:** Vercel

---

## Architecture

```
Browser -> Next.js Frontend (/app)
              ↓
         Next.js API Routes (/app/api)
              ↓
         Supabase PostgreSQL
```

Frontend and backend are co-located in one Next.js app, deployed as serverless functions on Vercel. No separate backend server is needed.

---

## API Endpoints

| Method | Route         | Description                                                |
| ------ | ------------- | ---------------------------------------------------------- |
| POST   | /api/auth     | Login or Signup (action: login or signup)                  |
| DELETE | /api/auth     | Logout                                                     |
| GET    | /api/expenses | List expenses. Supports ?category=Food and ?sort=date_desc |
| POST   | /api/expenses | Create expense. Supports idempotency_key                   |

---

## Key Design Decisions

**1. PostgreSQL via Supabase for money storage**
Amount is stored as DECIMAL(12,2) - not float - to avoid floating point errors with real money. Supabase gives us a managed PostgreSQL instance with row-level security, so each user can only access their own data.

**2. Idempotency on POST /expenses**
The API accepts an optional idempotency_key. If the same key is submitted twice (due to network retry, double-click, or page reload), the server returns the existing record instead of creating a duplicate. This makes the API safe for unreliable networks.

**3. Next.js API Routes instead of a separate Express backend**
Avoids CORS issues, reduces deployment complexity, and keeps the entire app in one repo with one deployment. API routes run as serverless functions on Vercel.

**4. Zod for validation**
All inputs are validated server-side before touching the database. Amount must be positive, all fields are required, category must be one of the allowed enum values.

**5. Row Level Security (RLS) in Supabase**
Even if the API key is exposed, users cannot read or write other users' data. RLS policies enforce data isolation at the database level.

---

## Trade-offs Made Due to Timebox

- No automated tests (unit or integration) - would add Jest + Supertest given more time
- No pagination on GET /expenses - acceptable for personal use scale
- Auth uses Supabase's built-in email auth instead of a custom JWT implementation
- No rate limiting on API routes

---

## What I Intentionally Did Not Build

- **User roles / permissions** - not needed for personal finance tool
- **Export to CSV** - out of scope for this assessment
- **Charts / analytics** - the assignment asks for a simple total, not visualizations
- **Offline support / PWA** - would add with more time

---

## Local Setup

1. Clone: `git clone https://github.com/DSurya11/fenmo-assessment.git`
2. Install: `npm install`
3. Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. Run: `npm run dev`
5. Open: http://localhost:3000
