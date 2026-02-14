/**
 * @vitest-environment jsdom
 * 
 * Unit tests for useCollection composable
 * Tests collection/inventory management operations
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

    it('should have no error by default', () => {
      const { error } = useCollection()
      expect(error.value).toBeNull()
    })
  })

  describe('fetchAllInventory', () => {
    it('should do nothing when user is not logged in', async () => {
      mockUser.value = null
      const { fetchAllInventory } = useCollection()

      await fetchAllInventory()

      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should fetch inventory with correct filters when user is logged in', async () => {
      mockUser.value = { id: 'test-user-id' }

      const mockInventoryData = [
        {
          id: 'inv-1',
          user_id: 'test-user-id',
          souvenir_id: 'sov-1',
          status: 'collected',
          souvenir: { id: 'sov-1', name: 'Test Souvenir' },
        },
      ]

      const mockOrder = vi.fn().mockResolvedValueOnce({
        data: mockInventoryData,
        error: null,
      })
      const mockEqStatus = vi.fn().mockReturnValueOnce({ order: mockOrder })
      const mockEqUser = vi.fn().mockReturnValueOnce({ eq: mockEqStatus })
      const mockSelect = vi.fn().mockReturnValueOnce({ eq: mockEqUser })

      mockSupabase.from.mockReturnValueOnce({ select: mockSelect })

      const { fetchAllInventory, collection } = useCollection()
      await fetchAllInventory()

      expect(mockSupabase.from).toHaveBeenCalledWith('user_collections')
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('souvenir: souvenirs'))
      expect(mockEqUser).toHaveBeenCalledWith('user_id', 'test-user-id')
      expect(mockEqStatus).toHaveBeenCalledWith('status', 'collected')
      expect(collection.value).toEqual(mockInventoryData)
    })

    it('should handle fetch errors', async () => {
      mockUser.value = { id: 'test-user-id' }

      const fetchError = new Error('Database error')
      const mockOrder = vi.fn().mockResolvedValueOnce({
        data: null,
        error: fetchError,
      })
      const mockEqStatus = vi.fn().mockReturnValueOnce({ order: mockOrder })
      const mockEqUser = vi.fn().mockReturnValueOnce({ eq: mockEqStatus })

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: mockEqUser,
        }),
      })

      const { fetchAllInventory, error } = useCollection()
      await fetchAllInventory()

      expect(error.value).toBe('Database error')
    })

    it('should set loading to true during fetch', async () => {
      mockUser.value = { id: 'test-user-id' }
      let loadingDuringFetch = false

      const mockOrder = vi.fn().mockImplementationOnce(async () => {
        loadingDuringFetch = useCollection().loading.value
        return { data: [], error: null }
      })
      const mockEqStatus = vi.fn().mockReturnValueOnce({ order: mockOrder })
      const mockEqUser = vi.fn().mockReturnValueOnce({ eq: mockEqStatus })

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: mockEqUser,
        }),
      })

      const { fetchAllInventory } = useCollection()
      await fetchAllInventory()

      expect(loadingDuringFetch).toBe(true)
    })
  })

  describe('fetchCollection', () => {
    it('should do nothing when user is not logged in', async () => {
      mockUser.value = null
      const { fetchCollection } = useCollection()

      await fetchCollection()

      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should fetch all collections without status filter', async () => {
      mockUser.value = { id: 'test-user-id' }

      const mockOrder = vi.fn().mockResolvedValueOnce({
        data: [],
        error: null,
      })
      const mockEqUser = vi.fn().mockReturnValueOnce({ order: mockOrder })

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: mockEqUser,
        }),
      })

      const { fetchCollection } = useCollection()
      await fetchCollection()

      expect(mockSupabase.from).toHaveBeenCalledWith('user_collections')
      expect(mockEqUser).toHaveBeenCalledWith('user_id', 'test-user-id')
    })
  })

  describe('addToCollection', () => {
    it('should return error when user is not logged in', async () => {
      mockUser.value = null
      const { addToCollection } = useCollection()

      const result = await addToCollection('sov-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('請先登入')
    })

    it('should upsert collection item when user is logged in', async () => {
      mockUser.value = { id: 'test-user-id' }

      const mockUpsert = vi.fn().mockResolvedValueOnce({ error: null })
      mockSupabase.from.mockReturnValueOnce({ upsert: mockUpsert })

      // Mock fetchAllInventory that gets called after add
      const mockOrder = vi.fn().mockResolvedValueOnce({ data: [], error: null })
      const mockEqStatus = vi.fn().mockReturnValueOnce({ order: mockOrder })
      const mockEqUser = vi.fn().mockReturnValueOnce({ eq: mockEqStatus })
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({ eq: mockEqUser }),
      })

      const { addToCollection } = useCollection()
      const result = await addToCollection('sov-1', 1, 'Test note')

      expect(result.success).toBe(true)
      expect(mockUpsert).toHaveBeenCalledWith(
        {
          user_id: 'test-user-id',
          souvenir_id: 'sov-1',
          quantity: 1,
          note: 'Test note',
          status: 'collected',
        },
        { onConflict: 'user_id, souvenir_id' }
      )
    })

    it('should handle upsert errors', async () => {
      mockUser.value = { id: 'test-user-id' }

      const upsertError = new Error('Upsert failed')
      const mockUpsert = vi.fn().mockResolvedValueOnce({ error: upsertError })
      mockSupabase.from.mockReturnValueOnce({ upsert: mockUpsert })

      const { addToCollection } = useCollection()
      const result = await addToCollection('sov-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Upsert failed')
    })
  })

  describe('removeFromCollection', () => {
    it('should delete collection item and update local state', async () => {
      const mockDelete = vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({ error: null }),
      })
      mockSupabase.from.mockReturnValueOnce({ delete: mockDelete })

      const { removeFromCollection, collection } = useCollection()
      collection.value = [
        { id: 'coll-1', souvenir_id: 'sov-1' },
        { id: 'coll-2', souvenir_id: 'sov-2' },
      ]

      const result = await removeFromCollection('coll-1')

      expect(result.success).toBe(true)
      expect(collection.value).toHaveLength(1)
      expect(collection.value[0].id).toBe('coll-2')
    })

    it('should handle delete errors', async () => {
      const deleteError = new Error('Delete failed')
      const mockDelete = vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({ error: deleteError }),
      })
      mockSupabase.from.mockReturnValueOnce({ delete: mockDelete })

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
      expect(result.error).toBe('請先登入')
    })

    it('should delete all user collections and clear local state', async () => {
      mockUser.value = { id: 'test-user-id' }

      const mockEq = vi.fn().mockResolvedValueOnce({ error: null })
      const mockDelete = vi.fn().mockReturnValueOnce({ eq: mockEq })
      mockSupabase.from.mockReturnValueOnce({ delete: mockDelete })

      const { clearAllCollections, collection } = useCollection()
      collection.value = [
        { id: 'coll-1' },
        { id: 'coll-2' },
      ]

      const result = await clearAllCollections()

      expect(result.success).toBe(true)
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id')
      expect(collection.value).toEqual([])
    })

    it('should handle clear errors', async () => {
      mockUser.value = { id: 'test-user-id' }

      const clearError = new Error('Clear failed')
      const mockEq = vi.fn().mockResolvedValueOnce({ error: clearError })
      const mockDelete = vi.fn().mockReturnValueOnce({ eq: mockEq })
      mockSupabase.from.mockReturnValueOnce({ delete: mockDelete })

      const { clearAllCollections } = useCollection()
      const result = await clearAllCollections()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Clear failed')
    })
  })
})
