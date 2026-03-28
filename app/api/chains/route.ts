import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set() {},
        remove() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { target_name, target_city, target_avatar, links } = await req.json()

  // Create chain
  const { data: chain, error } = await supabase
    .from('chains')
    .insert({ owner_id: user.id, target_name, target_city, target_avatar })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Add the owner as first link
  const allLinks = [
    { chain_id: chain.id, user_id: user.id, name: 'You', position: 0, status: 'confirmed' },
    ...links.map((l: any, i: number) => ({
      chain_id: chain.id,
      name: l.name,
      city: l.city,
      position: i + 1,
      status: 'pending',
    }))
  ]

  await supabase.from('chain_links').insert(allLinks)

  // Update degrees
  await supabase.from('chains').update({ degrees: links.length }).eq('id', chain.id)

  return NextResponse.json({ chain })
}
