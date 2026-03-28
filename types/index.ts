export type Profile = {
  id: string
  name: string
  city?: string
  bio?: string
  avatar_url?: string
  created_at: string
}

export type Chain = {
  id: string
  owner_id: string
  target_name: string
  target_avatar?: string
  target_city?: string
  degrees?: number
  status: 'active' | 'completed' | 'broken'
  chain_code: string
  created_at: string
  links?: ChainLink[]
  owner?: Profile
}

export type ChainLink = {
  id: string
  chain_id: string
  user_id?: string
  name: string
  city?: string
  position: number
  status: 'pending' | 'confirmed' | 'declined'
  created_at: string
}

export type Verification = {
  id: string
  chain_id: string
  link_id: string
  requested_by: string
  requested_email?: string
  status: 'pending' | 'confirmed' | 'declined'
  expires_at: string
  created_at: string
  chain?: Chain
  link?: ChainLink
  requester?: Profile
}
