/**
 * @vitest-environment jsdom
 * 
 * Unit tests for useAuth composable
 * Tests authentication state management, login/logout, and profile management
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../useAuth'

// Mock hoisted variables
const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    auth: {
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  }
}))

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset refs state between tests
    const { user, profile, loading, error, _resetAuth } = useAuth()
    user.value = null
    profile.value = null
    loading.value = false
    error.value = null
    _resetAuth()
  })

  describe('Initial State', () => {
    it('should have null user by default', () => {
      const { user } = useAuth()
      expect(user.value).toBeNull()
    })

    it('should have null profile by default', () => {
      const { profile } = useAuth()
      expect(profile.value).toBeNull()
    })

    it('should not be authenticated by default', () => {
      const { isAuthenticated } = useAuth()
      expect(isAuthenticated.value).toBe(false)
    })

    it('should not be admin by default', () => {
      const { isAdmin } = useAuth()
      expect(isAdmin.value).toBe(false)
    })

    it('should not be loading by default', () => {
      const { loading } = useAuth()
      expect(loading.value).toBe(false)
    })
  })

  describe('isAuthenticated computed', () => {
    it('should return true when user is set', () => {
      const { user, isAuthenticated } = useAuth()
      user.value = { id: 'test-user-id', email: 'test@example.com' }
      expect(isAuthenticated.value).toBe(true)
    })

    it('should return false when user is null', () => {
      const { user, isAuthenticated } = useAuth()
      user.value = null
      expect(isAuthenticated.value).toBe(false)
    })
  })

  describe('isAdmin computed', () => {
    it('should return true when profile.is_admin is true', () => {
      const { profile, isAdmin } = useAuth()
      profile.value = { id: 'test-user-id', is_admin: true, role: 'admin' }
      expect(isAdmin.value).toBe(true)
    })

    it('should return false when profile.is_admin is false', () => {
      const { profile, isAdmin } = useAuth()
      profile.value = { id: 'test-user-id', is_admin: false, role: 'user' }
      expect(isAdmin.value).toBe(false)
    })

    it('should return false when profile is null', () => {
      const { profile, isAdmin } = useAuth()
      profile.value = null
      expect(isAdmin.value).toBe(false)
    })
  })

  describe('signInWithGoogle', () => {
    it('should call supabase signInWithOAuth with google provider', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValueOnce({
        data: { url: 'https://oauth.example.com' },
        error: null,
      })

      const { signInWithGoogle, loading } = useAuth()

      const result = await signInWithGoogle('/my-collections')

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: expect.objectContaining({
          queryParams: { next: encodeURIComponent('/my-collections') },
          redirectTo: expect.stringContaining('/auth/callback'),
        }),
      })
      expect(result.error).toBeNull()
    })

    it('should set loading to true during sign in', async () => {
      let loadingDuringCall = false
      mockSupabase.auth.signInWithOAuth.mockImplementationOnce(async () => {
        loadingDuringCall = useAuth().loading.value
        return { data: {}, error: null }
      })

      const { signInWithGoogle } = useAuth()
      await signInWithGoogle()

      expect(loadingDuringCall).toBe(true)
    })

    it('should handle sign in errors', async () => {
      const testError = new Error('OAuth failed')
      mockSupabase.auth.signInWithOAuth.mockResolvedValueOnce({
        data: null,
        error: testError,
      })

      const { signInWithGoogle, error } = useAuth()
      const result = await signInWithGoogle()

      expect(result.error).toBe(testError)
      expect(error.value).toBe('OAuth failed')
    })
  })

  describe('signOut', () => {
    it('should call supabase signOut', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null })

      const { signOut, user, profile } = useAuth()
      user.value = { id: 'test-user-id' }
      profile.value = { id: 'test-user-id', is_admin: false }

      await signOut()

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(user.value).toBeNull()
      expect(profile.value).toBeNull()
    })

    it('should handle sign out errors', async () => {
      const testError = new Error('Sign out failed')
      mockSupabase.auth.signOut.mockResolvedValueOnce({ error: testError })

      const { signOut, error } = useAuth()
      const result = await signOut()

      expect(result.error).toBe(testError)
      expect(error.value).toBe('Sign out failed')
    })
  })

  describe('fetchProfile', () => {
    it('should return error when userId is not provided', async () => {
      const { fetchProfile } = useAuth()
      const result = await fetchProfile(null)

      expect(result.error).toBeDefined()
      expect(result.error.message).toBe('User ID is required')
    })

    it('should map role to is_admin correctly for admin', async () => {
      const mockProfileData = {
        id: 'test-user-id',
        role: 'admin',
        full_name: 'Test Admin',
      }

      const mockMaybeSingle = vi.fn().mockResolvedValueOnce({
        data: mockProfileData,
        error: null,
      })

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      })

      const { fetchProfile, profile } = useAuth()
      await fetchProfile('test-user-id')

      expect(profile.value.is_admin).toBe(true)
    })

    it('should map role to is_admin correctly for regular user', async () => {
      const mockProfileData = {
        id: 'test-user-id',
        role: 'user',
        full_name: 'Test User',
      }

      const mockMaybeSingle = vi.fn().mockResolvedValueOnce({
        data: mockProfileData,
        error: null,
      })

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      })

      const { fetchProfile, profile } = useAuth()
      await fetchProfile('test-user-id')

      expect(profile.value.is_admin).toBe(false)
    })
  })

  describe('initAuth', () => {
    it('should fetch session and set user when session exists', async () => {
      const mockSession = {
        user: { id: 'test-user-id', email: 'test@example.com' },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      })

      // Mock fetchProfile chain
      const mockProfileData = { id: 'test-user-id', role: 'user' }
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            maybeSingle: vi.fn().mockResolvedValueOnce({
              data: mockProfileData,
              error: null,
            }),
          }),
        }),
      })

      const { initAuth, user } = useAuth()
      await initAuth()

      expect(mockSupabase.auth.getSession).toHaveBeenCalled()
      expect(user.value).toEqual(mockSession.user)
    })

    it('should set up auth state change listener', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      const { initAuth } = useAuth()
      await initAuth()

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
    })

    it('should return existing promise if called multiple times', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const { initAuth } = useAuth()
      const promise1 = initAuth()
      const promise2 = initAuth()

      expect(promise1).toBe(promise2)
    })
  })

  describe('updateProfile', () => {
    it('should return error when user is not authenticated', async () => {
      const { updateProfile, user } = useAuth()
      user.value = null

      const result = await updateProfile({ full_name: 'New Name' })

      expect(result.error).toBeDefined()
      expect(result.error.message).toBe('User not authenticated')
    })
  })
})
