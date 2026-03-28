import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, chainName, verifyUrl, requesterName } = await request.json()

  const { error } = await resend.emails.send({
    from: 'Six Degrees <onboarding@resend.dev>',
    to,
    subject: `${requesterName} needs you to verify a connection`,
    html: `
      <div style="background:#0a0a0a;color:#fff;font-family:monospace;padding:40px;max-width:500px;">
        <div style="font-size:11px;color:#666;letter-spacing:4px;margin-bottom:24px;">SIX°</div>
        <h2 style="font-size:22px;margin:0 0 16px;">You're part of a chain.</h2>
        <p style="color:#888;font-size:13px;line-height:1.6;">
          <strong style="color:#fff">${requesterName}</strong> is trying to reach 
          <strong style="color:#c8ff00">${chainName}</strong> and believes you're a connection.
        </p>
        <p style="color:#888;font-size:13px;line-height:1.6;">
          Can you confirm this connection — or pass it one step closer?
        </p>
        <a href="${verifyUrl}" style="display:inline-block;background:#c8ff00;color:#0a0a0a;font-family:monospace;font-size:12px;font-weight:bold;padding:14px 28px;text-decoration:none;margin-top:24px;letter-spacing:2px;">
          VERIFY CONNECTION →
        </a>
        <p style="color:#444;font-size:11px;margin-top:32px;">
          If you don't know ${requesterName}, just ignore this email.
        </p>
      </div>
    `
  })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
