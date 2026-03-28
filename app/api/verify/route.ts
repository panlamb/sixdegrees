import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { verification_id, decision } = await req.json()

  // Get verification
  const { data: verification } = await supabase
    .from('verifications')
    .select('*, link:chain_links(*), chain:chains(*)')
    .eq('id', verification_id)
    .single()

  if (!verification) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Update verification
  await supabase
    .from('verifications')
    .update({ status: decision })
    .eq('id', verification_id)

  // Update link
  await supabase
    .from('chain_links')
    .update({ status: decision, user_id: user.id })
    .eq('id', verification.link_id)

  // If confirmed, check if all links confirmed → complete chain
  if (decision === 'confirmed') {
    const { data: links } = await supabase
      .from('chain_links')
      .select('status')
      .eq('chain_id', verification.chain_id)

    const allConfirmed = links?.every(l => l.status === 'confirmed')
    if (allConfirmed) {
      await supabase
        .from('chains')
        .update({ status: 'completed' })
        .eq('id', verification.chain_id)
    }
  }

  // If declined, break chain
  if (decision === 'declined') {
    await supabase
      .from('chains')
      .update({ status: 'broken' })
      .eq('id', verification.chain_id)
  }

  return NextResponse.json({ ok: true })
}
