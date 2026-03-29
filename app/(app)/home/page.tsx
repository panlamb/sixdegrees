'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Chain } from '@/types'
import { PageWrapper, ChainNodes } from '@/components/ui'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const [chains, setChains] = useState<Chain[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [globalStats, setGlobalStats] = useState({ chains: 0, verifications: 0, countries: 0 })
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data: chains } = await supabase
      .from('chains')
      .select('*, links:chain_links(*)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    const { count } = await supabase
      .from('verifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Load global stats
    const { count: chainCount } = await supabase
      .from('chains')
      .select('*', { count: 'exact', head: true })

    const { count: verifyCount } = await supabase
      .from('verifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed')

    setGlobalStats({
      chains: chainCount || 0,
      verifications: verifyCount || 0,
      countries: 0
    })

    setChains(chains || [])
    setPendingCount(count || 0)
    setLoading(false)
  }

  const stats = [
    { label: 'Chains Started', value: globalStats.chains.toString() },
    { label: 'Verified Links', value: globalStats.verifications.toString() },
    { label: 'Active Now', value: chains.filter(c => c.status === 'active').length.toString() },
  ]

  const anonymize = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0]
    return parts[0] + ' ' + parts[1][0] + '.'
  }

  return (
    <PageWrapper>
      {/* Status bar */}
      <div className="sticky top-0 z-50 bg-[#141414]/95 backdrop-blur border-b border-[#2a2a2a] px-5 h-12 flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-lime tracking-widest">SIX°</span>
        <span className="font-mono text-xs text-[#aaa]">9:41</span>
      </div>

      <div className="px-5 pb-28">
        {/* Hero */}
        <div className="pt-10 pb-8">
          <div className="font-mono text-xs tracking-widest text-lime uppercase mb-3">Experiment #6</div>
          <h1 className="font-serif text-[40px] font-black leading-[1.0] text-white tracking-tight mb-4">
            How far<br /><span className="text-lime">are you</span><br />from anyone?
          </h1>
          <p className="font-mono text-sm text-[#aaa] leading-relaxed">
            Build a chain of connections.<br />Verify each link. Discover your degrees.
          </p>
        </div>

        <Link href="/search">
          <button className="w-full py-4 bg-lime font-mono text-sm font-bold uppercase tracking-widest text-[#0a0a0a] rounded-sm hover:bg-[#d4f76a] transition-colors">
            Start a chain →
          </button>
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-[#2a2a2a] rounded-sm mt-7">
          {stats.map((s, i) => (
            <div key={i} className="bg-[#1a1a1a] px-2 py-4 text-center">
              <div className="font-serif text-2xl font-black text-lime">{s.value}</div>
              <div className="font-mono text-xs text-[#888] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chains */}
        <div className="mt-8">
          <div className="font-mono text-xs text-[#777] uppercase tracking-widest mb-4">Your Chains</div>
          <div className="flex flex-col gap-3">
            {loading && (
              <div className="font-mono text-sm text-[#666] py-8 text-center">Loading...</div>
            )}
            {!loading && chains.length === 0 && (
              <div className="font-mono text-sm text-[#666] py-10 text-center leading-relaxed">
                No chains yet.<br />Start your first experiment.
              </div>
            )}
            {chains.map(chain => (
              <div key={chain.id} className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-sm p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-mono text-xs text-[#888] uppercase tracking-widest mb-1">Target</div>
                    <div className="font-serif text-lg text-white">{chain.target_name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {chain.status === 'completed' && (
                      <Link href={`/c/${chain.id}`}>
                        <button className="border border-[#333] rounded-sm px-3 py-1 font-mono text-xs text-[#777] hover:text-[#aaa] hover:border-[#555] transition-colors">Share</button>
                      </Link>
                    )}
                    <div className={`font-mono text-sm font-bold px-3 py-1 rounded-sm ${chain.status === 'completed' ? 'bg-lime text-[#0a0a0a]' : 'bg-[#1a1a1a] text-lime'}`}>
                      {chain.degrees || '?'}°
                    </div>
                  </div>
                </div>
                {chain.links && chain.links.length > 0 && (
                  <ChainNodes steps={chain.links.sort((a, b) => a.position - b.position) as any} />
                )}
                {chain.status === 'active' && (
                  <div className="mt-3 font-mono text-xs text-[#888]">Waiting for verifications</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-[#141414]/97 backdrop-blur border-t border-[#2a2a2a] flex justify-around py-4 pb-8 z-50">
        {[
          { href: '/home', icon: '⬡', label: 'Home', active: true },
          { href: '/search', icon: '⌕', label: 'Search' },
          { href: '/verify', icon: '◈', label: 'Verify', badge: pendingCount },
          { href: '/profile', icon: '◯', label: 'Profile' },
        ].map(item => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 px-4 relative">
            {item.badge ? (
              <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-lime flex items-center justify-center font-mono text-[8px] font-bold text-[#0a0a0a]">{item.badge}</div>
            ) : null}
            <span style={{ fontSize: 22 }} className={item.active ? 'text-lime' : 'text-[#666]'}>{item.icon}</span>
            <span className={`font-mono text-xs ${item.active ? 'text-lime' : 'text-[#666]'}`}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </PageWrapper>
  )
}
