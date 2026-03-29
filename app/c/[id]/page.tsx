'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Chain } from '@/types'
import { PageWrapper, ChainNodes, Input, Button } from '@/components/ui'

type View = 'landing' | 'confirm-email' | 'confirmed' | 'declined' | 'start-own'

export default function ShareLinkPage({ params }: { params: { id: string } }) {
  const [chain, setChain] = useState<Chain | null>(null)
  const [view, setView] = useState<View>('landing')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => { loadChain() }, [])

  const loadChain = async () => {
    const { data } = await supabase
      .from('chains')
      .select('*, links:chain_links(*), owner:profiles!owner_id(*)')
      .eq('id', params.id)
      .single()
    setChain(data)
  }

  const handleConfirm = async () => {
    if (!email) return
    setLoading(true)

    // Find the pending link for this chain
    const { data: links } = await supabase
      .from('chain_links')
      .select('*')
      .eq('chain_id', params.id)
      .eq('status', 'pending')
      .order('position', { ascending: true })
      .limit(1)

    if (links && links.length > 0) {
      const link = links[0]
      // Update link with name and confirmed status
      await supabase
        .from('chain_links')
        .update({ 
          status: 'confirmed',
          name: name || link.name,
        })
        .eq('id', link.id)

      // Update verifications
      await supabase
        .from('verifications')
        .update({ status: 'confirmed' })
        .eq('chain_id', params.id)
        .eq('link_id', link.id)

      // Check if all confirmed
      const { data: allLinks } = await supabase
        .from('chain_links')
        .select('status')
        .eq('chain_id', params.id)

      const allConfirmed = allLinks?.every(l => l.status === 'confirmed')
      if (allConfirmed) {
        await supabase.from('chains').update({ status: 'completed' }).eq('id', params.id)
      }
    }

    setView('confirmed')
    setLoading(false)
  }

  const handleDecline = async () => {
    await supabase.from('chains').update({ status: 'broken' }).eq('id', params.id)
    setView('declined')
  }

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!chain) return (
    <PageWrapper>
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-mono text-[10px] text-[#555]">Loading chain...</div>
      </div>
    </PageWrapper>
  )

  const steps = (chain.links || [])
    .sort((a, b) => a.position - b.position)
    .map(l => ({ name: l.name, avatar: l.name.slice(0, 2).toUpperCase(), status: l.status }))

  return (
    <PageWrapper>
      <div className="sticky top-0 z-50 bg-[#141414]/95 backdrop-blur border-b border-[#2a2a2a] px-6 py-3 flex justify-between items-center">
        <span className="font-mono text-xs text-lime font-bold tracking-[0.15em]">SIX°</span>
        <span className="font-mono text-[9px] text-[#444]">sixdegrees.app</span>
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
              They think you're a link in the chain.<br />Do you know them personally?
            </p>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-5 mb-5">
            <div className="font-mono text-[8px] text-[#555] uppercase tracking-[0.15em] mb-4">THE CHAIN SO FAR</div>
            <ChainNodes steps={steps} />
          </div>

          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 mb-6">
            <div className="font-mono text-[8px] text-lime uppercase tracking-[0.15em] mb-3">WHAT IS SIX°?</div>
            <div className="space-y-2">
              {[
                '① Someone is trying to reach a target person.',
                "② They think you're a connection — confirm if you know them.",
                '③ Pass the chain one step closer to the target.',
                '④ See how many degrees separate any two people.',
              ].map((step, i) => (
                <div key={i} className="font-mono text-[10px] text-[#888] leading-relaxed">{step}</div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => setView('confirm-email')} fullWidth>
              Yes, I know them →
            </Button>
            <Button onClick={handleDecline} variant="ghost" fullWidth>
              No, I don't know them
            </Button>
            <button
              onClick={() => setView('start-own')}
              className="font-mono text-[10px] text-[#444] underline text-center mt-1"
            >
              Start my own chain
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM EMAIL */}
      {view === 'confirm-email' && (
        <div className="px-6 pb-16">
          <div className="pt-12 pb-8">
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-lime mb-3.5">CONFIRM CONNECTION</div>
            <h1 className="font-serif text-[30px] font-black leading-[1.1] text-white tracking-tight">
              One last step.
            </h1>
            <p className="font-mono text-[10px] text-[#666] mt-3 leading-relaxed">
              Enter your name and email to confirm your link in the chain.
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <Input label="Your Name" placeholder="Full name" value={name} onChange={setName} />
            <Input label="Email" placeholder="your@email.com" value={email} onChange={setEmail} type="email" />
          </div>

          <Button onClick={handleConfirm} disabled={loading || !email} fullWidth>
            {loading ? 'Confirming...' : 'Confirm my link →'}
          </Button>
          <p className="mt-4 font-mono text-[9px] text-[#333] text-center">No account needed. No spam.</p>
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

          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 mb-6">
            <div className="font-mono text-[9px] uppercase tracking-widest text-lime mb-2">Next step</div>
            <div className="font-mono text-[10px] text-[#888] leading-relaxed">
              Now pass the chain forward. Think of someone who might be closer to <strong className="text-white">{chain.target_name}</strong> — and send them this link.
            </div>
          </div>

          <div className="font-mono text-[9px] text-[#555] uppercase tracking-[0.15em] mb-3">SEND THIS LINK TO THE NEXT PERSON</div>
          <button
            onClick={copyLink}
            className={`w-full py-3.5 rounded-lg font-mono text-[11px] font-bold uppercase tracking-widest transition-all mb-2.5 ${copied ? 'bg-transparent border border-lime text-lime' : 'bg-lime text-[#141414]'}`}
          >
            {copied ? '✓ COPIED' : 'COPY LINK'}
          </button>
        </div>
      )}

      {/* DECLINED */}
      {view === 'declined' && (
        <div className="px-6 pb-16">
          <div className="pt-12 pb-8">
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#555] mb-3.5">LINK DECLINED</div>
            <h1 className="font-serif text-[34px] font-black leading-[1.05] text-white tracking-tight mb-3">
              No problem.
            </h1>
            <p className="font-mono text-[11px] text-[#888] leading-[1.7]">
              The chain will need to find another path to {chain.target_name}.
            </p>
          </div>
          <a href="/" className="block w-full py-3.5 text-center font-mono text-[11px] text-[#555] border border-[#2a2a2a] rounded-lg">
            Start your own chain →
          </a>
        </div>
      )}

      {/* START OWN */}
      {view === 'start-own' && (
        <div className="px-6 pb-16">
          <div className="pt-12 pb-8">
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-lime mb-3.5">JOIN SIX°</div>
            <h1 className="font-serif text-[30px] font-black leading-[1.1] text-white tracking-tight">
              Start your own<br />experiment.
            </h1>
          </div>
          <a href="/" className="block w-full py-4 text-center bg-lime font-mono text-sm font-bold uppercase tracking-widest text-[#141414] rounded-sm">
            Go to Six° →
          </a>
        </div>
      )}
    </PageWrapper>
  )
}
