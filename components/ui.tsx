'use client'
import { ReactNode } from 'react'
import clsx from 'clsx'

// ── Avatar ────────────────────────────────────────────────────────

export function Avatar({
  initials, size = 40, active = false, faded = false
}: {
  initials: string, size?: number, active?: boolean, faded?: boolean
}) {
  return (
    <div style={{ width: size, height: size, fontSize: size * 0.28 }} className={clsx(
      'rounded-full flex items-center justify-center font-mono font-bold flex-shrink-0 border',
      active ? 'bg-lime text-[#0a0a0a] border-lime' : 'bg-[#1a1a1a] text-[#555] border-[#222]',
      faded && 'opacity-30'
    )}>
      {initials}
    </div>
  )
}

// ── Button ────────────────────────────────────────────────────────

export function Button({
  children, onClick, variant = 'primary', disabled = false, fullWidth = false, size = 'md'
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost'
  disabled?: boolean
  fullWidth?: boolean
  size?: 'sm' | 'md'
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'font-mono font-bold uppercase tracking-widest rounded-sm transition-all',
        size === 'md' ? 'px-5 py-3.5 text-xs' : 'px-3 py-2 text-[10px]',
        fullWidth && 'w-full',
        variant === 'primary' && !disabled && 'bg-lime text-[#0a0a0a] hover:bg-[#d4f76a]',
        variant === 'primary' && disabled && 'bg-[#1a1a1a] text-[#333] cursor-default',
        variant === 'ghost' && 'bg-transparent border border-[#222] text-[#444] hover:border-[#333] hover:text-[#555]',
      )}
    >
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────

export function Input({
  label, placeholder, value, onChange, type = 'text'
}: {
  label?: string, placeholder?: string, value: string,
  onChange: (v: string) => void, type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#444]">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-[#111] border border-[#1e1e1e] rounded-sm text-xs text-[#f0f0f0] placeholder-[#333] outline-none focus:border-lime transition-colors"
      />
    </div>
  )
}

// ── Chain nodes ───────────────────────────────────────────────────

export function ChainNodes({ steps }: {
  steps: { name: string, avatar: string, status: string }[]
}) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => (
        <div key={i} className={clsx('flex items-center', i < steps.length - 1 && 'flex-1')}>
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative">
              <Avatar
                initials={step.avatar}
                size={34}
                active={step.status === 'confirmed'}
                faded={step.status === 'waiting'}
              />
              {step.status === 'confirmed' && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-lime border-2 border-[#0a0a0a] flex items-center justify-center text-[#0a0a0a]" style={{ fontSize: 6 }}>✓</div>
              )}
              {step.status === 'pending' && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-lime border-2 border-[#111] flex items-center justify-center text-[#0a0a0a] font-bold" style={{ fontSize: 7 }}>?</div>
              )}
            </div>
            <span className={clsx(
              'font-mono text-[7px] max-w-[36px] overflow-hidden text-ellipsis whitespace-nowrap text-center',
              step.status === 'confirmed' ? 'text-[#555]' :
              step.status === 'pending' ? 'text-lime' : 'text-[#2a2a2a]'
            )}>
              {step.name.split(' ')[0]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={clsx(
              'flex-1 h-px mb-4 mx-0.5',
              step.status === 'confirmed' ? 'bg-lime/25' : 'bg-[#1e1e1e]'
            )} style={{ minWidth: 8 }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Page wrapper ──────────────────────────────────────────────────

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex justify-center">
      <div className="w-full max-w-[390px] relative">
        {children}
      </div>
    </div>
  )
}

// ── Label ─────────────────────────────────────────────────────────

export function Label({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime">
      {children}
    </div>
  )
}

export function SubLabel({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#333]">
      {children}
    </div>
  )
}
