'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Profile } from '@/types'
import { PageWrapper, Avatar, Input, Button } from '@/components/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [selected, setSelected] = useState<Profile | null>(null)
  const [links, setLinks] = useState<{ name: string }[]>([])
  const [newLink, setNewLink] = useState('')
  const [adding, setAdding] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleQuery = async (q: string) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('name', `%${q}%`)
      .limit(10)
    setResults(data || [])
  }

  const addLink = () => {
    if (!newLink.trim()) return
    setLinks(prev => [...prev, { name: newLink.trim() }])
    setNewLink('')
    setAdding(false)
  }

  const removeLink = (i: number) => {
    setLinks(prev => prev.filter((_, idx) => idx !== i))
  }

  const submit = async () => {
    const targetName = selected?.name || query
    if (!targetName) return
    setLoading(true)

    const res = await fetch('/api/chains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_name: targetName,
        target_city: selected?.city || '',
        target_avatar: targetName.slice(0, 2).toUpperCase(),
        links: links.map((l, i) => ({ name: l.name, position: i + 1 }))
      })
    })

    if (res.ok) {
      setSubmitted(true)
      setTimeout(() => router.push('/home'), 2000)
    }
    setLoading(false)
  }

  const targetName = selected?.name || (query.length > 1 ? query : '')

  if (submitted) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <div className="font-serif text-[56px] font-black text-lime leading-none tracking-tighter mb-4">
            {links.length}°
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-lime mb-3">CHAIN CREATED</div>
          <div className="font-mono text-xs text-[#555] leading-relaxed">
            Verifications sent.<br />Waiting for confirmations.
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#0f0f0f] px-5 h-11 flex items-center justify-between">
        <span className="font-mono text-[11px] text-[#222] tracking-[0.15em]">SIX°</span>
      </div>

      <div className="px-5 pb-28">
        <div className="pt-12 pb-6">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime mb-2">NEW CHAIN</div>
          <h1 className="font-serif text-[30px] font-black text-[#f0f0f0] tracking-tight">
            {!targetName ? 'Pick a target.' : `Chain to ${targetName}.`}
          </h1>
        </div>

        {/* Step 1: Pick target */}
        {!selected && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#333] mb-3">
              SEARCH OR TYPE ANY NAME
            </div>
            <Input
              placeholder="e.g. Elon Musk, Barack Obama..."
              value={query}
              onChange={handleQuery}
            />

            {results.length > 0 && (
              <div className="mt-2 flex flex-col gap-px">
                {results.map(user => (
                  <div
                    key={user.id}
                    onClick={() => { setSelected(user); setQuery(user.name); }}
                    className="flex items-center gap-3 px-4 py-3.5 bg-[#111] rounded-sm cursor-pointer hover:bg-[#161616] transition-colors"
                  >
                    <Avatar initials={user.name.slice(0, 2).toUpperCase()} size={38} active />
                    <div className="flex-1">
                      <div className="font-serif text-[14px] text-[#f0f0f0]">{user.name}</div>
                      {user.city && <div className="font-mono text-[9px] text-[#444] mt-0.5">{user.city}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query.length > 1 && results.length === 0 && (
              <div className="mt-3 px-4 py-3 bg-[#111] border border-[#1e1e1e] rounded-sm">
                <div className="font-mono text-[9px] text-[#444] mb-1">NOT ON SIX° YET</div>
                <div className="font-serif text-[14px] text-[#f0f0f0]">{query}</div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Build chain */}
        {targetName && (
          <div>
            <div className="flex items-center gap-3 bg-[#0d1a00] border border-lime/20 rounded-sm px-4 py-3 mb-6">
              <Avatar initials={targetName.slice(0, 2).toUpperCase()} size={38} />
              <div className="flex-1">
                <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-lime/50 mb-0.5">TARGET</div>
                <div className="font-serif text-[15px] text-[#f0f0f0]">{targetName}</div>
              </div>
              <button
                onClick={() => { setSelected(null); setQuery(''); setLinks([]); setResults([]); }}
                className="font-mono text-[10px] text-[#333] hover:text-[#555]"
              >✕</button>
            </div>

            <div className="bg-[#111] border border-[#1a1a1a] rounded-sm p-4 mb-4">
              <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#333] mb-4">YOUR CHAIN</div>

              <div className="flex items-center gap-3 mb-1">
                <Avatar initials="PK" size={34} active />
                <div className="flex-1">
                  <div className="font-mono text-[11px] text-[#f0f0f0]">You</div>
                  <div className="font-mono text-[8px] text-lime mt-0.5 uppercase tracking-[0.1em]">confirmed</div>
                </div>
                <div className="font-mono text-[9px] text-[#2a2a2a]">#1</div>
              </div>

              {links.map((link, i) => (
                <div key={i}>
                  <div className="w-px h-4 bg-[#1e1e1e] ml-4 my-0.5" />
                  <div className="flex items-center gap-3">
                    <Avatar initials={link.name.slice(0, 2).toUpperCase()} size={34} />
                    <div className="flex-1">
                      <div className="font-mono text-[11px] text-[#f0f0f0]">{link.name}</div>
                      <div className="font-mono text-[8px] text-[#c8f05a88] mt-0.5 uppercase tracking-[0.1em]">pending</div>
                    </div>
                    <button onClick={() => removeLink(i)} className="font-mono text-[10px] text-[#333] hover:text-[#555]">✕</button>
                  </div>
                </div>
              ))}

              <div className="w-px h-4 bg-[#1e1e1e] ml-4 my-0.5" />
              <div className="flex items-center gap-3 opacity-25">
                <div className="w-[34px] h-[34px] rounded-full border border-dashed border-[#444] flex items-center justify-center text-[#444] text-lg flex-shrink-0">?</div>
                <div className="font-mono text-[11px] text-[#555]">{targetName}</div>
              </div>
            </div>

            {adding ? (
              <div className="bg-[#111] border border-lime rounded-sm p-4 mb-3">
                <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-lime mb-3">ADD NEXT LINK</div>
                <Input
                  placeholder="Full name of intermediary..."
                  value={newLink}
                  onChange={setNewLink}
                />
                <div className="flex gap-2 mt-3">
                  <Button onClick={addLink} fullWidth>Add →</Button>
                  <button
                    onClick={() => setAdding(false)}
                    className="px-4 py-3 border border-[#222] rounded-sm font-mono text-[10px] text-[#444]"
                  >✕</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="w-full py-3.5 border border-dashed border-[#2a2a2a] rounded-sm font-mono text-[11px] uppercase tracking-widest text-[#444] mb-3"
              >+ Add intermediary</button>
            )}

            {links.length > 0 && !adding && (
              <Button onClick={submit} disabled={loading} fullWidth>
                {loading ? 'Sending...' : 'Send verifications →'}
              </Button>
            )}

            {links.length === 0 && !adding && (
              <div className="font-mono text-[9px] text-[#2a2a2a] text-center mt-2">
                Add at least one intermediary to continue.
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-[#080808]/97 backdrop-blur border-t border-[#161616] flex justify-around py-2.5 pb-6 z-50">
        {[
          { href: '/home', icon: '⬡', label: 'HOME' },
          { href: '/search', icon: '⌕', label: 'SEARCH', active: true },
          { href: '/verify', icon: '◈', label: 'VERIFY' },
          { href: '/profile', icon: '◯', label: 'PROFILE' },
        ].map(item => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 px-4">
            <span style={{ fontSize: 17 }} className={item.active ? 'text-lime' : 'text-[#2a2a2a]'}>{item.icon}</span>
            <span className={`font-mono text-[7px] tracking-[0.15em] ${item.active ? 'text-lime' : 'text-[#2a2a2a]'}`}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </PageWrapper>
  )
}
