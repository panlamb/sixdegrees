import { createClient } from '@/lib/supabase'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data: chain } = await supabase
    .from('chains')
    .select('*, owner:profiles!owner_id(*)')
    .eq('id', params.id)
    .single()

  if (!chain) return { title: 'Six Degrees' }

  const title = `Can you connect to ${chain.target_name}?`
  const description = `${chain.owner?.name || 'Someone'} is trying to reach ${chain.target_name} in 6 steps. You might be the missing link.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'Six°',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    }
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
