'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Verification } from '@/types'
import { PageWrapper, Avatar, ChainNodes, SubLabel } from '@/components/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function VerifyPage() {
  const [requests, setRequests] = useState<Verification[]>([])
  const [decided, setDecided] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { loadRequests() }, [])

  const loadRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data } = await supabase
      .from('verifications')
      .select('*, chain:chains(*), link:chain_links(*), requester:profiles!requested_by(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    setRequests(data || [])
    setLoading(false)
  }

  const decide = async (verification: Verification, decision: 'confirmed' | 'declined') => {
    setDecided(prev => ({ ...prev, [verification.id]: decision }))
    await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verification_id: verification.id, decision })
    })
  }

  const pending = requests.filter(r => !decided[r.id])
  const resolved = requests.filter(r => decided[r.id])

  return (
    <PageWrapper>
      <div className="sticky top-0 z-50 bg-[#141414]/95 backdrop-blur border-b border-[#1a1a1a] px-5 h-11 flex items-center justify-between">
        <span className="font-mono text-[11px] text-[#222] tracking-[0.15em]">SIX°</span>
      </div>

      <div className="px-5 pb-28">
        <div className="pt-12 pb-7">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime mb-2.5">INBOX</div>
          <div className="flex items-baseline justify-between">
            <h1 className="font-serif text-[30px] font-black text-white tracking-tight">Verifications</h1>
            {pending.length > 0 && (
              <div className="bg-lime text-[#141414] font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full">{pending.length}</div>
            )}
          </div>
        </div>

        {loading && <div className="font-mono text-[10px] text-[#888] py-10 text-center">Loading...</div>}

        {!loading && pending.length === 0 && resolved.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl text-[#1e1e1e] mb-3">◎</div>
            <div className="font-serif text-lg text-[#555]">No pending verifications.</div>
            <div className="font-mono text-[9px] text-[#222] mt-2">You'll be notified when someone adds you to a chain.</div>
          </div>
        )}

        {pending.map(req => (
          <div key={req.id} className={`bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl mb-3.5 overflow-hidden transition-opacity ${decided[req.id] ? 'opacity-0' : 'opacity-100'}`}>
            <div className="bg-[#1a2a00] border-b border-[#1e2e00] px-5 py-2.5 flex justify-between items-center">
              <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-lime">VERIFICATION REQUEST</span>
              <span className="font-mono text-[8px] text-[#888]">expires {new Date(req.expires_at).toLocaleDateString()}</span>
            </div>
            <div className="p-5">
              {req.requester && (
                <div className="flex items-center gap-3 mb-4">
                  <Avatar initials={req.requester.name?.slice(0, 2).toUpperCase() || '??'} size={44} active />
                  <div>
                    <div className="font-serif text-[16px] text-white">{req.requester.name}</div>
                    <div className="font-mono text-[8px] text-[#777] mt-0.5">{req.chain?.chain_code}</div>
                  </div>
                </div>
              )}

              <div className="bg-[#141414] rounded-md p-3.5 mb-4 border-l-2 border-lime/20">
                <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#777] mb-1.5">THE CLAIM</div>
                <div className="font-mono text-[10px] text-[#777] leading-relaxed">
                  {req.requester?.name} says they know you and you can help reach <strong className="text-[#888]">{req.chain?.target_name}</strong>.
                </div>
              </div>

              <div className="bg-[#141414] rounded-md p-3.5 mb-5">
                <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#888] mb-3">TARGET: {req.chain?.target_name}</div>
                <div className="font-mono text-[9px] text-white mb-3">
                  Do you know <span className="text-lime">{req.requester?.name?.split(' ')[0]}</span>?
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => decide(req, 'declined')}
                    className="flex-1 py-3 font-mono text-[10px] font-bold uppercase tracking-widest rounded-md border border-[#2a1a1a] text-[#553333] hover:border-red-900 hover:text-red-400 transition-colors"
                  >NO</button>
                  <button
                    onClick={() => decide(req, 'confirmed')}
                    className="flex-[2] py-3 bg-lime font-mono text-[10px] font-bold uppercase tracking-widest rounded-md text-[#141414] hover:bg-[#d4f76a] transition-colors"
                  >YES, CONFIRM →</button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {resolved.length > 0 && (
          <div className="mt-8">
            <SubLabel>RESOLVED</SubLabel>
            <div className="mt-3 flex flex-col gap-1.5">
              {resolved.map(r => (
                <div key={r.id} className="flex justify-between items-center px-4 py-3 bg-[#0d0d0d] rounded-md">
                  <div>
                    <div className="font-mono text-[10px] text-[#888]">{r.requester?.name}</div>
                    <div className="font-mono text-[8px] text-[#222] mt-0.5">{r.chain?.chain_code}</div>
                  </div>
                  <div className={`font-mono text-[9px] uppercase tracking-[0.1em] ${decided[r.id] === 'confirmed' ? 'text-lime' : 'text-[#553333]'}`}>
                    {decided[r.id] === 'confirmed' ? '✓ confirmed' : '✕ declined'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-[#141414]/97 backdrop-blur border-t border-[#161616] flex justify-around py-2.5 pb-6 z-50">
        {[
          { href: '/home', icon: '⬡', label: 'HOME' },
          { href: '/search', icon: '⌕', label: 'SEARCH' },
          { href: '/verify', icon: '◈', label: 'VERIFY', active: true },
          { href: '/profile', icon: '◯', label: 'PROFILE' },
        ].map(item => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 px-4">
            <span style={{ fontSize: 17 }} className={item.active ? 'text-lime' : 'text-[#555]'}>{item.icon}</span>
            <span className={`font-mono text-[7px] tracking-[0.15em] ${item.active ? 'text-lime' : 'text-[#555]'}`}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </PageWrapper>
  )
}
