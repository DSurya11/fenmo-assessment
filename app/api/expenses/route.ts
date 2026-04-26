import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ExpenseSchema = z.object({
  amount: z.number().positive({ message: 'Amount must be greater than 0' }),
  category: z.enum(['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Other']),
  description: z.string().min(1, { message: 'Description is required' }),
  date: z.string().min(1, { message: 'Date is required' }),
  idempotency_key: z.string().optional()
})

// POST /api/expenses - Create new expense
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const validation = ExpenseSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { amount, category, description, date, idempotency_key } = validation.data

    // Handle idempotency - if same key exists return existing record
    if (idempotency_key) {
      const { data: existing } = await supabase
        .from('expenses')
        .select('*')
        .eq('idempotency_key', idempotency_key)
        .single()
      
      if (existing) {
        return NextResponse.json(
          { success: true, data: existing },
          { status: 200 }
        )
      }
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert([{ amount, category, description, date, idempotency_key, user_id: session.user.id }])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/expenses - Get all expenses with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const sort = searchParams.get('sort_date_desc')

    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', session.user.id)

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    if (sort === 'false') {
      query = query.order('date', { ascending: true })
    } else {
      query = query.order('date', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
