import { ref, computed, watch } from 'vue'

/**
 * usePagination - 前端分頁邏輯管理
 * 
 * 功能：
 * - 自動計算總頁數
 * - 提供分頁資料（paginatedItems）
 * - 頁面導航（上一頁、下一頁、跳頁）
 * - 每頁筆數設定（10/25/50/100）
 * - 記住使用者偏好（localStorage）
 */

const DEFAULT_PAGE_SIZE = 25
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const STORAGE_KEY = 'pagination-pageSize'

export function usePagination(items, options = {}) {
    const {
        defaultPageSize = DEFAULT_PAGE_SIZE,
        pageSizeOptions = PAGE_SIZE_OPTIONS,
        storageKey = STORAGE_KEY
    } = options

    // 從 localStorage 載入使用者偏好
    const loadPageSizePreference = () => {
        try {
            const saved = localStorage.getItem(storageKey)
            if (saved) {
                const size = parseInt(saved, 10)
                if (pageSizeOptions.includes(size)) {
                    return size
                }
            }
        } catch (e) {
            console.warn('Failed to load page size preference:', e)
        }
        return defaultPageSize
    }

    // 儲存使用者偏好到 localStorage
    const savePageSizePreference = (size) => {
        try {
            localStorage.setItem(storageKey, size.toString())
        } catch (e) {
            console.warn('Failed to save page size preference:', e)
        }
    }

    // Reactive state
    const currentPage = ref(1)
    const pageSize = ref(loadPageSizePreference())

    // Computed properties
    const totalPages = computed(() => {
        if (!items.value || items.value.length === 0) return 0
        return Math.ceil(items.value.length / pageSize.value)
    })

    const paginatedItems = computed(() => {
        if (!items.value || items.value.length === 0) return []

        const start = (currentPage.value - 1) * pageSize.value
        const end = start + pageSize.value
        return items.value.slice(start, end)
    })

    const hasNextPage = computed(() => {
        return currentPage.value < totalPages.value
    })

    const hasPrevPage = computed(() => {
        return currentPage.value > 1
    })

    const startIndex = computed(() => {
        if (!items.value || items.value.length === 0) return 0
        return (currentPage.value - 1) * pageSize.value + 1
    })

    const endIndex = computed(() => {
        if (!items.value || items.value.length === 0) return 0
        const end = currentPage.value * pageSize.value
        return Math.min(end, items.value.length)
    })

    // Methods
    const nextPage = () => {
        if (hasNextPage.value) {
            currentPage.value++
            scrollToTop()
        }
    }

    const prevPage = () => {
        if (hasPrevPage.value) {
            currentPage.value--
            scrollToTop()
        }
    }

    const goToPage = (page) => {
        const pageNum = parseInt(page, 10)
        if (pageNum >= 1 && pageNum <= totalPages.value) {
            currentPage.value = pageNum
            scrollToTop()
        }
    }

    const setPageSize = (size) => {
        const newSize = parseInt(size, 10)
        if (pageSizeOptions.includes(newSize)) {
            pageSize.value = newSize
            currentPage.value = 1 // 重置為第一頁
            savePageSizePreference(newSize)
            scrollToTop()
        }
    }

    const reset = () => {
        currentPage.value = 1
    }

    // 切換頁面時捲動到頂部
    const scrollToTop = () => {
        // 平滑捲動到頁面頂部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    // 監聽 items 變化，當資料變更時重置為第一頁
    watch(
        () => items.value?.length,
        (newLength, oldLength) => {
            // 只有在資料筆數變化時才重置
            if (newLength !== oldLength && currentPage.value > totalPages.value) {
                currentPage.value = 1
            }
        }
    )

    return {
        // State
        currentPage,
        pageSize,

        // Computed
        totalPages,
        paginatedItems,
        hasNextPage,
        hasPrevPage,
        startIndex,
        endIndex,

        // Methods
        nextPage,
        prevPage,
        goToPage,
        setPageSize,
        reset,

        // Options
        pageSizeOptions
    }
}
