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
      const result = await addToCollection('sov-1', 'collected', 'test-portfolio-id')

      expect(result.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('user_collections')
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'test-user-id',
          portfolio_id: 'test-portfolio-id',
          souvenir_id: 'sov-1',
          status: 'collected',
        }),
        expect.objectContaining({ onConflict: 'portfolio_id,souvenir_id' })
      )
    })

    it('should NOT trigger addToInventory when status is holding (decoupled)', async () => {
      mockUser.value = { id: 'test-user-id' }

      // Mock collection upsert
      const mockCollSingle = vi.fn().mockResolvedValue({ data: { id: 'coll-1' }, error: null })
      const mockCollSelect = vi.fn().mockReturnValue({ single: mockCollSingle })
      const mockCollUpsert = vi.fn().mockReturnValue({ select: mockCollSelect })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'user_collections') return { upsert: mockCollUpsert }
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn() }) }) }
      })

      const { addToCollection } = useCollection()
      const result = await addToCollection('sov-1', 'holding', 'test-portfolio-id')

      expect(result.success).toBe(true)
      expect(mockSupabase.from).not.toHaveBeenCalledWith('user_inventory')
      expect(mockSupabase.from).toHaveBeenCalledWith('user_collections')
    })
  })

  describe('addToInventory', () => {
    it('should call upsert on user_inventory table', async () => {
      mockUser.value = { id: 'test-user-id' }

      const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'inv-1' }, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect })
      mockSupabase.from.mockReturnValue({ upsert: mockUpsert })

      const { addToInventory } = useCollection()
      const result = await addToInventory('2330', '台積電', 'test-portfolio-id')

      expect(result.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('user_inventory')
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'test-user-id',
          portfolio_id: 'test-portfolio-id',
          stock_code: '2330',
          stock_name: '台積電',
        }),
        expect.any(Object)
      )
    })
  })
  describe('removeFromCollection', () => {
    it('should handle delete errors from collection', async () => {
      mockUser.value = { id: 'test-user-id' }
      const deleteError = new Error('Delete failed')

      // Mock select (to find the item before deleting)
      const mockSingle = vi.fn().mockResolvedValue({ data: { status: 'collected' }, error: null })
      const mockEqSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSelect })

      // Mock delete
      const mockEqDelete = vi.fn().mockResolvedValue({ error: deleteError })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEqDelete })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'user_collections') {
          return {
            select: mockSelect,
            delete: mockDelete
          }
        }
        return {}
      })

      const { removeFromCollection } = useCollection()
      const result = await removeFromCollection('coll-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Delete failed')
    })

    it('should handle "inv_" prefix and delete from user_inventory ONLY (decoupled)', async () => {
      mockUser.value = { id: 'test-user-id' }

      // Mock select for inventory
      const mockSingle = vi.fn().mockResolvedValue({ data: { portfolio_id: 'p1', stock_code: '2330' }, error: null })
      const mockEqSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSelect })

      // Mock delete for inventory
      const mockEqDelete = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEqDelete })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'user_inventory') return { select: mockSelect, delete: mockDelete }
        return { update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn() }) }) }
      })

      const { removeFromCollection } = useCollection()
      const result = await removeFromCollection('inv_4118')

      expect(result.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('user_inventory')
      expect(mockEqDelete).toHaveBeenCalledWith('id', 4118)
      // Should NOT sync to user_collections
      expect(mockSupabase.from).not.toHaveBeenCalledWith('user_collections')
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

    it('should delete from user_inventory and update user_collections status if decoupled (but still keeping clearAll logic)', async () => {
      mockUser.value = { id: 'test-user-id' }

      // Mock sequence for clearAllCollections
      const mockEqUpdate = vi.fn().mockResolvedValue({ error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: mockEqUpdate }) })
      
      const mockEqDelete = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEqDelete })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'user_inventory') return { delete: mockDelete }
        if (table === 'user_collections') return { update: mockUpdate }
        return {}
      })

      const { clearAllCollections } = useCollection()
      const result = await clearAllCollections(true)

      expect(result.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('user_inventory')
      // Note: clearAllCollections STILL has synchronization logic for clearing everything
      expect(mockSupabase.from).toHaveBeenCalledWith('user_collections')
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'collected' })
    })
  })
})
