import { createContext } from 'react'
import type { Profile } from '../types/profile'

export interface ProfileContextValue {
  profile: Profile
  setProfile: (profile: Profile) => void
}

export const ProfileContext = createContext<ProfileContextValue | null>(null)
