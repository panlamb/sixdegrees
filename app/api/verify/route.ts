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

      // Send badge email to chain owner
      const { data: owner } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', verification.chain.owner_id)
        .single()

      const { data: ownerAuth } = await supabase.auth.admin.getUserById(verification.chain.owner_id)
      const ownerEmail = ownerAuth?.user?.email

      if (ownerEmail) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const degrees = links?.length || 0
        await resend.emails.send({
          from: 'Six Degrees <onboarding@resend.dev>',
          to: ownerEmail,
          subject: `🔗 Chain complete — you reached ${verification.chain.target_name} in ${degrees} degrees`,
          html: `
            <div style="background:#0a0a0a;color:#fff;font-family:monospace;padding:40px;max-width:500px;">
              <div style="font-size:11px;color:#666;letter-spacing:4px;margin-bottom:24px;">SIX°</div>
              <div style="font-size:48px;font-weight:900;color:#c8ff00;line-height:1;margin-bottom:16px;">${degrees}°</div>
              <h2 style="font-size:22px;margin:0 0 16px;font-family:serif;">Your chain is complete.</h2>
              <p style="color:#888;font-size:13px;line-height:1.6;">
                You reached <strong style="color:#fff">${verification.chain.target_name}</strong> in 
                <strong style="color:#c8ff00">${degrees} degrees of separation</strong>.
              </p>
              <p style="color:#888;font-size:13px;line-height:1.6;">
                Every link in your chain confirmed the connection. The experiment worked.
              </p>
              <div style="margin-top:32px;padding:20px;background:#111;border-left:3px solid #c8ff00;">
                <div style="font-size:10px;color:#666;letter-spacing:2px;margin-bottom:8px;">YOUR PATH</div>
                <div style="font-size:13px;color:#c8ff00;">${owner?.name || 'You'} → ... → ${verification.chain.target_name}</div>
              </div>
              <p style="color:#444;font-size:11px;margin-top:32px;">Six Degrees of Separation · The experiment continues.</p>
            </div>
          `
        })
      }
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
