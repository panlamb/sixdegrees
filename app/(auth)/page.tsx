'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { PageWrapper, Input, Button } from '@/components/ui'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    setError('')
    if (!email || !password) return
    if (mode === 'signup' && !name) return
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name } }
      })
      if (error) { setError(error.message); setLoading(false); return }
      setOnboarding(true)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/home')
    }
    setLoading(false)
  }

  const targets = [
    { name: 'Elon Musk', label: 'CEO, Tesla & SpaceX' },
    { name: 'Taylor Swift', label: 'Artist' },
    { name: 'Barack Obama', label: 'Former US President' },
    { name: 'Pope Francis', label: 'Head of the Catholic Church' },
    { name: 'LeBron James', label: 'NBA Player' },
    { name: 'Oprah Winfrey', label: 'Media mogul' },
  ]

  if (onboarding) {
    return (
      <PageWrapper>
        <div className="px-6 pb-16">
          <div className="pt-14 pb-8">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime mb-4">SIX°</div>
            <h1 className="font-serif text-3xl font-black leading-[1.05] text-[#f0f0f0] tracking-tight mb-3">
              Who do you want<br />to <span className="text-lime">reach?</span>
            </h1>
            <p className="font-mono text-[10px] text-[#444] leading-relaxed">
              Pick a target and start building your chain.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-8">
            {targets.map(t => (
              <button
                key={t.name}
                onClick={() => router.push('/search?target=' + encodeURIComponent(t.name))}
                className="bg-[#111] border border-[#1e1e1e] rounded-lg p-4 text-left hover:border-lime/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center font-mono text-sm text-[#555] mb-3">
                  {t.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="font-mono text-[11px] text-[#f0f0f0] mb-1">{t.name}</div>
                <div className="font-mono text-[9px] text-[#444]">{t.label}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => router.push('/home')}
            className="w-full py-3 font-mono text-[10px] text-[#444] uppercase tracking-widest border border-[#1a1a1a] rounded-sm"
          >
            Skip for now
          </button>
        </div>
      </PageWrapper>
    )
  }

  if (done) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime mb-4">ALMOST THERE</div>
          <h1 className="font-serif text-3xl font-black text-[#f0f0f0] mb-3">Check your email.</h1>
          <p className="font-mono text-xs text-[#444] leading-relaxed">
            We sent a confirmation link to<br />
            <span className="text-[#888]">{email}</span>
          </p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="px-6 pb-16">
        <div className="pt-14 pb-10">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime mb-4">SIX°</div>
          <h1 className="font-serif text-4xl font-black leading-[1.05] text-[#f0f0f0] tracking-tight">
            {mode === 'signup' ? <>Join the<br /><span className="text-lime">experiment.</span></> : <>Welcome<br />back.</>}
          </h1>
        </div>

        <div className="flex gap-2 mb-8">
          {(['signup', 'login'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-widest rounded-sm transition-all border ${mode === m ? 'bg-lime text-[#0a0a0a] border-lime' : 'bg-transparent border-[#1e1e1e] text-[#444]'}`}>
              {m === 'signup' ? 'Sign Up' : 'Log In'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {mode === 'signup' && (
            <Input label="Your Name" placeholder="Full name" value={name} onChange={setName} />
          )}
          <Input label="Email" placeholder="your@email.com" value={email} onChange={setEmail} type="email" />
          <Input label="Password" placeholder="Min. 8 characters" value={password} onChange={setPassword} type="password" />
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-[#1a0808] border border-[#3a1a1a] rounded-sm font-mono text-[10px] text-[#f04040]">
            {error}
          </div>
        )}

        <Button onClick={handleSubmit} disabled={loading} fullWidth>
          {loading ? 'Please wait...' : mode === 'signup' ? 'Create account →' : 'Log in →'}
        </Button>

        <p className="mt-5 font-mono text-[9px] text-[#2a2a2a] text-center">
          No spam. No feed. Just connections.
        </p>
      </div>
    </PageWrapper>
  )
}
