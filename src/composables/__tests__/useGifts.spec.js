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
vi.mock('../usePortfolio', () => ({
  usePortfolio: () => ({
    currentPortfolioId: ref('test-portfolio-id'),
    isCombinedView: ref(false),
  }),
}))

// Mock useAuth
vi.mock('../useAuth', () => ({
  useAuth: () => ({
    user: mockUser
  })
}))

// Mock useLocalStorageCache
vi.mock('../useLocalStorageCache', () => ({
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

const createQueryBuilder = (result) => {
  const builder = {
    then: function (resolve, reject) {
      return Promise.resolve(typeof result === 'function' ? result() : result).then(resolve, reject)
    }
  }
  const methods = ['select', 'eq', 'or', 'and', 'in', 'order', 'limit', 'gte', 'lte', 'ilike', 'single', 'maybeSingle', 'upsert', 'delete', 'update', 'insert']
  methods.forEach(m => {
    builder[m] = vi.fn(() => builder)
  })
  return builder
}

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

      const mockBuilder = createQueryBuilder({ data: mockGiftsData, error: null })
      mockSupabase.from.mockReturnValueOnce(mockBuilder)

      const { fetchAllGifts, gifts } = useGifts()
      await fetchAllGifts()

      expect(mockSupabase.from).toHaveBeenCalledWith('souvenirs')
    })

    it('should apply year filter', async () => {
      const mockBuilder = createQueryBuilder({ data: [], error: null })
      mockSupabase.from.mockReturnValueOnce(mockBuilder)

      const { fetchAllGifts } = useGifts()
      await fetchAllGifts({ year: 2024 })

      expect(mockSupabase.from).toHaveBeenCalledWith('souvenirs')
    })

    it('should set loading state during fetch', async () => {
      let loadingDuringFetch = false
      const { fetchAllGifts, loading } = useGifts()
      const mockBuilder = createQueryBuilder(() => {
        loadingDuringFetch = loading.value
        return { data: [], error: null }
      })
      mockSupabase.from.mockReturnValueOnce(mockBuilder)

      await fetchAllGifts({ year: 2024 })

      expect(loadingDuringFetch).toBe(true)
    })

    it('should handle errors', async () => {
      const testError = new Error('Database error')
      const mockBuilder = createQueryBuilder({ data: null, error: testError })
      mockSupabase.from.mockReturnValueOnce(mockBuilder)

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
        { id: 'coll-1', souvenir_id: 'gift-1', gift: { id: 'gift-1', name: 'Test' } },
      ]

      const mockBuilder = createQueryBuilder({ data: mockCollectionsData, error: null })
      const mockUserInventoryEmptyBuilder = createQueryBuilder({ data: [], error: null })

      mockSupabase.from.mockImplementation((t) => t === 'user_collections' ? mockBuilder : mockUserInventoryEmptyBuilder)

      const { fetchMyCollections, myCollections } = useGifts()
      await fetchMyCollections()

      expect(mockSupabase.from).toHaveBeenCalledWith('user_collections')
      expect(mockBuilder.eq).toHaveBeenCalledWith('portfolio_id', 'test-portfolio-id')
      expect(mockBuilder.in).toHaveBeenCalledWith('status', ['collected', 'holding'])
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

  // Mutation tests moved to useCollection.spec.js

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
        if (table === 'user_collections') return createQueryBuilder({ data: mockCollData, error: null })
        if (table === 'user_inventory') return createQueryBuilder({ data: mockInvData, error: null })
        return createQueryBuilder({ data: [], error: null })
      })

      const { fetchUserInventoryIds } = useGifts()
      const result = await fetchUserInventoryIds()

      expect(result).toEqual(new Set(['sov-1', 'sov-2', 'sov-3']))
    })
  })
})
