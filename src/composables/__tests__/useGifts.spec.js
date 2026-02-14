/**
 * @vitest-environment jsdom
 * 
 * Unit tests for useGifts composable
 * Tests gift fetching, collection management, and filtering operations
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

// Mock usePortfolio composable
vi.mock('./usePortfolio', () => ({
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
import { useGifts } from '../useGifts'

describe('useGifts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.value = null
  })

  describe('Initial State', () => {
    it('should have empty gifts array by default', () => {
      const { gifts } = useGifts()
      expect(gifts.value).toEqual([])
    })

    it('should have empty myCollections array by default', () => {
      const { myCollections } = useGifts()
      expect(myCollections.value).toEqual([])
    })

    it('should not be loading by default', () => {
      const { loading } = useGifts()
      expect(loading.value).toBe(false)
    })

    it('should have no error by default', () => {
      const { error } = useGifts()
      expect(error.value).toBeNull()
    })
  })

  describe('fetchAllGifts', () => {
    it('should fetch gifts without filters', async () => {
      const mockGiftsData = [
        { id: 'gift-1', code: '2330', name: '台積電' },
        { id: 'gift-2', code: '2317', name: '鴻海' },
      ]

      // Build mock chain
      const mockOrder = vi.fn().mockReturnThis()
      const mockLte = vi.fn().mockReturnThis()
      const mockGte = vi.fn().mockReturnThis()
      const mockIlike = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
        gte: mockGte,
        lte: mockLte,
        ilike: mockIlike,
        order: mockOrder,
      })

      // Final resolution
      mockOrder.mockResolvedValueOnce({
        data: mockGiftsData,
        error: null,
      })

      mockSupabase.from.mockReturnValueOnce({ select: mockSelect })

      const { fetchAllGifts, gifts } = useGifts()
      await fetchAllGifts()

      expect(mockSupabase.from).toHaveBeenCalledWith('souvenirs')
    })

    it('should apply year filter', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
      })

      mockSupabase.from.mockReturnValueOnce({ select: mockSelect })

      const { fetchAllGifts } = useGifts()
      await fetchAllGifts({ year: 2024 })

      expect(mockSupabase.from).toHaveBeenCalledWith('souvenirs')
    })

    it('should set loading state during fetch', async () => {
      let loadingDuringFetch = false

      const mockChain = {
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementationOnce(async () => {
          loadingDuringFetch = useGifts().loading.value
          return { data: [], error: null }
        }),
      }
      const mockSelect = vi.fn().mockReturnValue(mockChain)
      mockSupabase.from.mockReturnValueOnce({ select: mockSelect })

      const { fetchAllGifts } = useGifts()
      await fetchAllGifts({ year: 2024 })

      expect(loadingDuringFetch).toBe(true)
    })

    it('should handle errors', async () => {
      const testError = new Error('Database error')
      const mockChain = {
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValueOnce({ data: null, error: testError }),
      }
      const mockSelect = vi.fn().mockReturnValue(mockChain)
      mockSupabase.from.mockReturnValueOnce({ select: mockSelect })

      const { fetchAllGifts, error } = useGifts()
      await fetchAllGifts({ year: 2024 })

      expect(error.value).toBe('Database error')
    })
  })

  describe('fetchMyCollections', () => {
    it('should do nothing when user is not logged in', async () => {
      mockUser.value = null
      const { fetchMyCollections } = useGifts()

      await fetchMyCollections()

      // Should not call supabase when not logged in
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should fetch collections when user is logged in', async () => {
      mockUser.value = { id: 'test-user-id' }

      const mockCollectionsData = [
        { id: 'coll-1', souvenir_id: 'gift-1', souvenir: { id: 'gift-1', name: 'Test' } },
      ]

      const mockIn = vi.fn().mockReturnValueOnce({ order: mockOrder })
      const mockEq = vi.fn().mockReturnValueOnce({ in: mockIn })
      const mockSelect = vi.fn().mockReturnValueOnce({ eq: mockEq })

      mockSupabase.from.mockReturnValueOnce({ select: mockSelect })

      const { fetchMyCollections, myCollections } = useGifts()
      await fetchMyCollections()

      expect(mockSupabase.from).toHaveBeenCalledWith('user_collections')
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id')
      expect(mockIn).toHaveBeenCalledWith('status', ['collected', 'holding'])
      expect(myCollections.value).toEqual(mockCollectionsData)
    })
  })

  describe('isInCollection', () => {
    it('should return true when gift is in collection', () => {
      const { myCollections, isInCollection } = useGifts()
      myCollections.value = [
        { id: 'coll-1', souvenir_id: 'gift-1' },
        { id: 'coll-2', souvenir_id: 'gift-2' },
      ]

      expect(isInCollection('gift-1')).toBe(true)
      expect(isInCollection('gift-2')).toBe(true)
    })

    it('should return false when gift is not in collection', () => {
      const { myCollections, isInCollection } = useGifts()
      myCollections.value = [
        { id: 'coll-1', souvenir_id: 'gift-1' },
      ]

      expect(isInCollection('gift-3')).toBe(false)
    })
  })

  describe('getCollection', () => {
    it('should return collection record for a given gift', () => {
      const { myCollections, getCollection } = useGifts()
      const mockCollection = { id: 'coll-1', souvenir_id: 'gift-1', note: 'Test note' }
      myCollections.value = [mockCollection]

      expect(getCollection('gift-1')).toEqual(mockCollection)
    })

    it('should return undefined when gift is not in collection', () => {
      const { myCollections, getCollection } = useGifts()
      myCollections.value = []

      expect(getCollection('gift-1')).toBeUndefined()
    })
  })

  describe('addToCollection', () => {
    it('should return error when user is not logged in', async () => {
      mockUser.value = null
      const { addToCollection } = useGifts()

      const result = await addToCollection('gift-1')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should add gift to collection when logged in', async () => {
      mockUser.value = { id: 'test-user-id' }

      const mockInsert = vi.fn().mockResolvedValueOnce({ error: null })
      mockSupabase.from.mockReturnValueOnce({ insert: mockInsert })

      // Mock fetchMyCollections
      const mockOrder = vi.fn().mockResolvedValueOnce({ data: [], error: null })
      const mockEq = vi.fn().mockReturnValueOnce({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValueOnce({ eq: mockEq })
      mockSupabase.from.mockReturnValueOnce({ select: mockSelect })

      const { addToCollection } = useGifts()
      const result = await addToCollection('gift-1')

      expect(result.success).toBe(true)
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        souvenir_id: 'gift-1',
        status: 'collected'
      }, { onConflict: 'user_id,souvenir_id,status' })
    })
  })

  describe('removeFromCollection', () => {
    it('should remove collection item', async () => {
      const mockEq = vi.fn().mockResolvedValueOnce({ error: null })
      const mockDelete = vi.fn().mockReturnValueOnce({ eq: mockEq })
      mockSupabase.from.mockReturnValueOnce({ delete: mockDelete })

      const { removeFromCollection, myCollections } = useGifts()
      myCollections.value = [
        { id: 'coll-1', souvenir_id: 'gift-1' },
        { id: 'coll-2', souvenir_id: 'gift-2' },
      ]

      const result = await removeFromCollection('coll-1')

      expect(result.success).toBe(true)
      expect(myCollections.value).toHaveLength(1)
      expect(myCollections.value[0].id).toBe('coll-2')
    })

    it('should handle deletion errors', async () => {
      const deleteError = new Error('Delete failed')
      const mockEq = vi.fn().mockResolvedValueOnce({ error: deleteError })
      const mockDelete = vi.fn().mockReturnValueOnce({ eq: mockEq })
      mockSupabase.from.mockReturnValueOnce({ delete: mockDelete })

      const { removeFromCollection } = useGifts()
      const result = await removeFromCollection('coll-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Delete failed')
    })
  })

  describe('fetchUserInventoryIds', () => {
    it('should return empty set when user is not logged in', async () => {
      mockUser.value = null
      const { fetchUserInventoryIds } = useGifts()

      const result = await fetchUserInventoryIds()

      expect(result).toEqual(new Set())
    })

    it('should return set of inventory IDs when logged in', async () => {
      mockUser.value = { id: 'test-user-id' }

      const mockCollData = [
        { souvenirs: { code: 'sov-1' } },
      ]
      const mockInvData = [
        { stock_code: 'sov-2' },
        { stock_code: 'sov-3' },
      ]

      mockSupabase.from.mockImplementation((table) => {
        const mockChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn(),
          single: vi.fn(),
          or: vi.fn().mockReturnThis(),
          // Make it thenable to work with await directly on the query
          then: vi.fn().mockImplementation((onFulfilled) => {
            if (table === 'user_collections') {
              return Promise.resolve({ data: mockCollData, error: null }).then(onFulfilled)
            }
            if (table === 'user_inventory') {
              return Promise.resolve({ data: mockInvData, error: null }).then(onFulfilled)
            }
            return Promise.resolve({ data: [], error: null }).then(onFulfilled)
          })
        }

        // Handle the .eq chain
        mockChain.eq.mockReturnValue(mockChain)

        return mockChain
      })

      const { fetchUserInventoryIds } = useGifts()
      const result = await fetchUserInventoryIds()

      expect(result).toEqual(new Set(['sov-1', 'sov-2', 'sov-3']))
    })
  })
})
