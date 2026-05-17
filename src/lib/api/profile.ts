import { api } from '@/lib/api/apiClient'
import type { Personal } from '@/types/user'

/**
 * Fetch current personal profile.
 * Primary route follows Sigma2/backend parity: /personal/profile.
 * Fallback /buyer/profile is kept for compatibility with older deployments.
 */
export async function fetchCurrentPersonalProfile(): Promise<Personal> {
  try {
    return await api.get<Personal>('/personal/profile')
  } catch {
    return api.get<Personal>('/buyer/profile')
  }
}

