'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Chain, Profile } from '@/types'

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myChains, setMyChains] = useState<Chain[]>([])
  const [participatingChains, setParticipatingChains] = useState<Chain[]>([])
  const [totalDegrees, setTotalDegrees] = useState(0)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profileData) { setProfile(profileData); setName(profileData.name || '') }

    const { data: createdChains } = await supabase.from('chains').select('*, links:chain_links(*)').eq('owner_id', user.id).order('created_at', { ascending: false })
    if (createdChains) setMyChains(createdChains)

    const { data: myLinks } = await supabase.from('chain_links').select('chain_id').eq('user_id', user.id)
    if (myLinks && myLinks.length > 0) {
      const chainIds = myLinks.map((l: any) => l.chain_id)
      const { data: partChains } = await supabase.from('chains').select('*, links:chain_links(*)').in('id', chainIds).neq('owner_id', user.id).order('created_at', { ascending: false })
      if (partChains) setParticipatingChains(partChains)
    }

    const completedChains = [...(createdChains || [])].filter((c: any) => c.status === 'completed' && c.degrees)
    if (completedChains.length > 0) {
      const avg = completedChains.reduce((sum: number, c: any) => sum + (c.degrees || 0), 0) / completedChains.length
      setTotalDegrees(Math.round(avg * 10) / 10)
    }
    setLoading(false)
  }

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ name }).eq('id', profile.id)
    setProfile({ ...profile, name })
    setEditing(false)
    setSaving(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-[#666] font-mono text-sm">Loading...</div></div>

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between">
        <a href="/home" className="font-mono text-xs text-[#666] hover:text-white transition-colors">← back</a>
        <div className="font-mono text-xs text-[#444]">SIX°</div>
        <button onClick={signOut} className="font-mono text-xs text-[#666] hover:text-red-400 transition-colors">sign out</button>
      </div>
      <div className="max-w-lg mx-auto px-6 py-8 space-y-8">
        <div className="border border-[#1a1a1a] rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#111] border border-[#222] flex items-center justify-center text-2xl">
                {profile?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                {editing ? (
                  <input value={name} onChange={e => setName(e.target.value)} className="bg-[#111] border border-[#333] rounded px-3 py-1 text-white font-mono text-sm w-48 focus:outline-none" autoFocus />
                ) : (
                  <div className="font-mono text-lg">{profile?.name || 'Anonymous'}</div>
                )}
                <div className="font-mono text-xs text-[#555] mt-1">member since {new Date(profile?.created_at || '').toLocaleDateString('en', { month: 'short', year: 'numeric' })}</div>
              </div>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="font-mono text-xs text-[#555] px-3 py-1 border border-[#333] rounded">cancel</button>
                <button onClick={saveProfile} disabled={saving} className="font-mono text-xs text-black bg-white px-3 py-1 rounded">{saving ? '...' : 'save'}</button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="font-mono text-xs text-[#555] hover:text-white border border-[#222] px-3 py-1 rounded">edit</button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#111]">
            <div className="text-center"><div className="font-mono text-2xl">{myChains.length}</div><div className="font-mono text-xs text-[#555] mt-1">chains created</div></div>
            <div className="text-center"><div className="font-mono text-2xl">{participatingChains.length}</div><div className="font-mono text-xs text-[#555] mt-1">participating</div></div>
            <div className="text-center"><div className="font-mono text-2xl">{totalDegrees || '—'}</div><div className="font-mono text-xs text-[#555] mt-1">avg degrees</div></div>
          </div>
        </div>
        {myChains.length > 0 && <div><div className="font-mono text-xs text-[#555] uppercase tracking-widest mb-3">Chains I started</div><div className="space-y-2">{myChains.map((chain: any) => <ChainRow key={chain.id} chain={chain} />)}</div></div>}
        {participatingChains.length > 0 && <div><div className="font-mono text-xs text-[#555] uppercase tracking-widest mb-3">Chains I'm in</div><div className="space-y-2">{participatingChains.map((chain: any) => <ChainRow key={chain.id} chain={chain} />)}</div></div>}
        {myChains.length === 0 && participatingChains.length === 0 && <div className="text-center py-12 font-mono text-xs text-[#444]">No chains yet. <a href="/home" className="underline">Start one.</a></div>}
      </div>
    </div>
  )
}

function ChainRow({ chain }: { chain: any }) {
  const linkCount = chain.links?.length || 0
  const statusColor = { active: '#666', completed: '#4ade80', broken: '#ef4444' }[chain.status as string] || '#666'
  return (
    <div className="border border-[#1a1a1a] rounded-lg px-4 py-3 flex items-center justify-between">
      <div>
        <div className="font-mono text-sm">{chain.target_name}</div>
        <div className="font-mono text-xs text-[#555] mt-0.5">{linkCount} link{linkCount !== 1 ? 's' : ''} · {new Date(chain.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
      </div>
      <div className="flex items-center gap-3">
        {chain.degrees && <div className="font-mono text-xs text-[#555]">{chain.degrees}°</div>}
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
      </div>
    </div>
  )
}
