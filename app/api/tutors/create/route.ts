import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 })
    }

    const payload = await request.json()
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/create-tutor-complete`

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        apikey: anonKey,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
  }
}
