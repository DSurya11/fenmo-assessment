import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const AuthSchema = z.object({
  email: z.string().email({ message: 'Valid email required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  action: z.enum(['login', 'signup'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = AuthSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, action } = validation.data
    const supabase = createRouteHandlerClient({ cookies })

    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      return NextResponse.json({ success: true, data }, { status: 201 })
    }

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 401 })
      return NextResponse.json({ success: true, data }, { status: 200 })
    }

  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.signOut()
    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
