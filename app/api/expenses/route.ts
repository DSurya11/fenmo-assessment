import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ExpenseSchema = z.object({
  amount: z
    .number()
    .positive({ message: "Amount must be greater than 0" })
    .max(999999999, { message: "Amount too large" }),
  category: z.enum([
    "Food",
    "Transport",
    "Shopping",
    "Entertainment",
    "Health",
    "Bills",
    "Other",
  ]),
  description: z.string().min(1).max(500),
  date: z
    .string()
    .min(1, { message: "Date is required" })
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  idempotency_key: z.string().optional(),
});

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value || value === "your_supabase_url") return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!isValidHttpUrl(url) || !anonKey || anonKey === "your_anon_key") {
    return null;
  }
  return { url, anonKey };
}

async function getSupabase() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.");
  }

  const cookieStore = await cookies();
  return createServerClient(
    env.url,
    env.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Components.
          }
        },
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = ExpenseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 }
      );
    }

    const { amount, category, description, date, idempotency_key } = validation.data;

    if (idempotency_key) {
      const { data: existing } = await supabase
        .from("expenses")
        .select("*")
        .eq("idempotency_key", idempotency_key)
        .eq("user_id", session.user.id)
        .single();

      if (existing) {
        return NextResponse.json({ success: true, data: existing }, { status: 200 });
      }
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert([
        {
          amount,
          category,
          description,
          date,
          idempotency_key,
          user_id: session.user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const sortDateDesc = searchParams.get("sort_date_desc") ?? undefined;

    let query = supabase.from("expenses").select("*").eq("user_id", session.user.id);

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    query = query.order("date", { ascending: sortDateDesc === "false" });

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}