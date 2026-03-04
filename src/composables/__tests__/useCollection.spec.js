/**
 * @vitest-environment jsdom
 * 
 * Unit tests for useCollection composable
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

// Mock hoisted variables
const { mockUser, mockSupabase } = vi.hoisted(() => ({
  mockUser: { value: null },
  mockSupabase: {
    from: vi.fn(),
  }
}))

// Mock useAuth composable
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    profile: ref(null),
    loading: ref(false),
    error: ref(null),
    isAdmin: ref(false),
    isAuthenticated: ref(!!mockUser.value),
  }),
}))

// Mock usePortfolio composable
vi.mock('@/composables/usePortfolio', () => ({
  usePortfolio: () => ({
    currentPortfolioId: ref('test-portfolio-id'),
    isCombinedView: ref(false),
  }),
}))

// Mock useLocalStorageCache
vi.mock('./useLocalStorageCache', () => ({
  useLocalStorageCache: () => ({
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    getWithMetadata: vi.fn(),
  }),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

// Import after mocks
import { useCollection } from '../useCollection'

describe('useCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.value = null
  })

  describe('Initial State', () => {
    it('should have empty collection array by default', () => {
      const { collection } = useCollection()
      expect(collection.value).toEqual([])
    })

    it('should not be loading by default', () => {
      const { loading } = useCollection()
      expect(loading.value).toBe(false)
    })
  })

  describe('addToCollection', () => {
    it('should return error when user is not logged in', async () => {
      mockUser.value = null
      const { addToCollection } = useCollection()

      const result = await addToCollection('sov-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('未登入')
    })

    it('should upsert collection item with correct portfolio_id', async () => {
      mockUser.value = { id: 'test-user-id' }

      const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'coll-1' }, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect })
      mockSupabase.from.mockReturnValue({ upsert: mockUpsert })

      const { addToCollection } = useCollection()
      const result = await addToCollection('sov-1', 'collected', 'custom-portfolio-id')

      expect(result.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('user_collections')
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'test-user-id',
          portfolio_id: 'custom-portfolio-id',
          souvenir_id: 'sov-1',
          status: 'collected',
        }),
        expect.objectContaining({ onConflict: 'portfolio_id,souvenir_id' })
      )
    })
  })

  describe('removeFromCollection', () => {
    it('should handle delete errors from collection', async () => {
      mockUser.value = { id: 'test-user-id' }
      const deleteError = new Error('Delete failed')

      const mockEq2 = vi.fn().mockResolvedValue({ error: deleteError })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 })
      mockSupabase.from.mockReturnValue({ delete: mockDelete })

      const { removeFromCollection } = useCollection()
      const result = await removeFromCollection('coll-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Delete failed')
    })
  })

  describe('clearAllCollections', () => {
    it('should return error when user is not logged in', async () => {
      mockUser.value = null
      const { clearAllCollections } = useCollection()

      const result = await clearAllCollections()

      expect(result.success).toBe(false)
      expect(result.error).toBe('未登入')
    })

    it('should delete from user_inventory if isInventory is true', async () => {
      mockUser.value = { id: 'test-user-id' }

      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      mockSupabase.from.mockReturnValue({ delete: mockDelete })

      const { clearAllCollections } = useCollection()
      const result = await clearAllCollections(true)

      expect(result.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('user_inventory')
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id')
    })
  })
})
