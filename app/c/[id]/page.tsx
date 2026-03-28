'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Chain } from '@/types'
import { PageWrapper, ChainNodes, Input, Button } from '@/components/ui'

type View = 'landing' | 'signup-confirm' | 'signup-own' | 'confirmed'

export default function ShareLinkPage({ params }: { params: { id: string } }) {
  const [chain, setChain] = useState<Chain | null>(null)
  const [view, setView] = useState<View>('landing')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadChain()
  }, [])

  const loadChain = async () => {
    const { data } = await supabase
      .from('chains')
      .select('*, links:chain_links(*), owner:profiles!owner_id(*)')
      .eq('id', params.id)
      .single()
    setChain(data)
  }

  const handleSignup = async (mode: 'confirm' | 'own') => {
    if (!name || !email || !password) return
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } }
    })

    if (!error) setView('confirmed')
    setLoading(false)
  }

  const copyLink = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/c/${params.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!chain) return (
    <PageWrapper>
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-mono text-[10px] text-[#888]">Loading chain...</div>
      </div>
    </PageWrapper>
  )

  const steps = (chain.links || [])
    .sort((a, b) => a.position - b.position)
    .map(l => ({ name: l.name, avatar: l.name.slice(0, 2).toUpperCase(), status: l.status }))

  return (
    <PageWrapper>
      <div className="sticky top-0 z-50 bg-[#141414]/95 backdrop-blur border-b border-[#1a1a1a] px-6 py-3 flex justify-between items-center">
        <span className="font-mono text-xs text-lime font-bold tracking-[0.15em]">SIX°</span>
        <span className="font-mono text-[9px] text-[#555]">sixdegrees.app</span>
      </div>

      {/* LANDING */}
      {view === 'landing' && (
        <div className="px-6 pb-16">
          <div className="pt-12 pb-8">
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-lime mb-3.5">SIX° · CHAIN INVITE</div>
            <h1 className="font-serif text-[34px] font-black leading-[1.05] text-white tracking-tight mb-3.5">
              <span className="text-lime">{chain.owner?.name || 'Someone'}</span><br />
              is trying to reach<br />
              {chain.target_name}.
            </h1>
            <p className="font-mono text-[11px] text-[#888] leading-[1.7]">
              They think you're a link in the chain.<br />Are they right?
            </p>
          </div>

          {/* Chain card */}
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-5 mb-5">
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="font-mono text-[8px] text-[#888] uppercase tracking-[0.15em] mb-1">THE CHAIN</div>
                <div className="font-mono text-[9px] text-[#777]">{chain.chain_code}</div>
              </div>
              <div className="font-serif text-[36px] font-black text-lime leading-none tracking-tighter">
                {chain.degrees}°
              </div>
            </div>
            <ChainNodes steps={steps} />
            <div className="mt-4 px-3.5 py-2.5 bg-[#1a2a00] rounded-md border-l-2 border-lime/20">
              <div className="font-mono text-[10px] text-[#777] leading-relaxed">
                {chain.owner?.name} says you can help connect to {chain.target_name}.
              </div>
            </div>
          </div>

          {/* What is this */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 mb-6">
            <div className="font-mono text-[8px] text-[#555] uppercase tracking-[0.15em] mb-2">WHAT IS SIX°?</div>
            <div className="font-mono text-[11px] text-[#888] leading-[1.7]">
              A social experiment. Any two people on Earth are connected through at most 6 intermediaries. Six° lets you prove it — one verified link at a time.
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <Button onClick={() => setView('signup-confirm')} fullWidth>
              Confirm my link →
            </Button>
            <Button onClick={() => setView('signup-own')} variant="ghost" fullWidth>
              Start my own chain
            </Button>
          </div>
        </div>
      )}

      {/* SIGNUP */}
      {(view === 'signup-confirm' || view === 'signup-own') && (
        <div className="px-6 pb-16">
          <div className="pt-12 pb-8">
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-lime mb-3.5">
              {view === 'signup-confirm' ? 'CONFIRM YOUR LINK' : 'JOIN SIX°'}
            </div>
            <h1 className="font-serif text-[30px] font-black leading-[1.1] text-white tracking-tight">
              {view === 'signup-confirm'
                ? <>Create your account<br />to confirm.</>
                : <>Start your own<br />experiment.</>
              }
            </h1>
            {view === 'signup-confirm' && (
              <p className="font-mono text-[10px] text-[#777] mt-3 leading-relaxed">
                Your confirmation keeps {chain.owner?.name}'s chain alive.
              </p>
            )}
          </div>

          {view === 'signup-confirm' && (
            <div className="bg-[#1a2a00] border border-[#1e2e00] rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
              <div className="font-mono text-[9px] text-lime flex-1">
                {chain.owner?.name} → <span className="text-[#888]">you</span> → {chain.target_name}
              </div>
              <div className="font-serif text-lg font-black text-lime">{chain.degrees}°</div>
            </div>
          )}

          <div className="flex flex-col gap-4 mb-6">
            <Input label="Your Name" placeholder="Full name" value={name} onChange={setName} />
            <Input label="Email" placeholder="your@email.com" value={email} onChange={setEmail} type="email" />
            <Input label="Password" placeholder="Min. 8 characters" value={password} onChange={setPassword} type="password" />
          </div>

          <Button
            onClick={() => handleSignup(view === 'signup-confirm' ? 'confirm' : 'own')}
            disabled={loading || !name || !email || !password}
            fullWidth
          >
            {loading ? 'Creating account...' : view === 'signup-confirm' ? 'Create account & confirm →' : 'Join Six° →'}
          </Button>

          <p className="mt-4 font-mono text-[9px] text-[#555] text-center">No spam. No feed. Just connections.</p>
        </div>
      )}

      {/* CONFIRMED */}
      {view === 'confirmed' && (
        <div className="px-6 pb-16">
          <div className="pt-12 pb-8">
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-lime mb-3.5">LINK CONFIRMED</div>
            <h1 className="font-serif text-[34px] font-black leading-[1.05] text-white tracking-tight mb-3">
              You're in<br /><span className="text-lime">the chain.</span>
            </h1>
            <p className="font-mono text-[11px] text-[#888] leading-[1.7]">
              {chain.owner?.name}'s chain is one step closer to {chain.target_name}.
            </p>
          </div>

          <div className="bg-[#0f1a00] border border-lime/20 rounded-xl p-5 mb-5">
            <div className="flex justify-between items-center mb-5">
              <div className="font-mono text-[8px] text-lime/40 uppercase tracking-[0.15em]">VERIFIED PATH</div>
              <div className="font-serif text-[32px] font-black text-lime leading-none tracking-tighter">{chain.degrees}°</div>
            </div>
            <ChainNodes steps={steps.map(s => ({ ...s, status: 'confirmed' }))} />
          </div>

          <div className="font-mono text-[9px] text-[#888] uppercase tracking-[0.15em] mb-3">SHARE THIS CHAIN</div>
          <button
            onClick={copyLink}
            className={`w-full py-3.5 rounded-lg font-mono text-[11px] font-bold uppercase tracking-widest transition-all mb-2.5 ${copied ? 'bg-transparent border border-lime text-lime' : 'bg-lime text-[#141414]'}`}
          >
            {copied ? '✓ COPIED' : 'COPY LINK'}
          </button>
          <button className="w-full py-3.5 rounded-lg font-mono text-[11px] uppercase tracking-widest border border-[#2a2a2a] text-[#777]">
            Open the app →
          </button>
        </div>
      )}
    </PageWrapper>
  )
}
