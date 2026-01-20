/**
 * useLocalStorageCache - 通用 localStorage 快取管理工具
 * 
 * 功能：
 * - 提供 get/set/remove/clear/has 方法
 * - 自動處理 JSON 序列化/反序列化
 * - 版本控制（當資料結構變更時自動清除舊快取）
 * - 錯誤處理（localStorage 不可用時不會中斷程式）
 * - 支援當日快取驗證（用於當年度資料）
 */

const CACHE_VERSION = '1.0'

export function useLocalStorageCache(options = {}) {
    const {
        prefix = 'stock-souvenir',
        version = CACHE_VERSION
    } = options

    /**
     * 檢查 localStorage 是否可用
     */
    const isLocalStorageAvailable = () => {
        try {
            const test = '__localStorage_test__'
            localStorage.setItem(test, test)
            localStorage.removeItem(test)
            return true
        } catch (e) {
            console.warn('localStorage is not available:', e)
            return false
        }
    }

    /**
     * 生成完整的快取鍵值
     */
    const getFullKey = (key) => {
        return `${prefix}:${key}`
    }

    /**
     * 取得快取資料
     * @param {string} key - 快取鍵值
     * @returns {any|null} - 快取資料或 null
     */
    const get = (key) => {
        if (!isLocalStorageAvailable()) return null

        try {
            const fullKey = getFullKey(key)
            const cached = localStorage.getItem(fullKey)

            if (!cached) return null

            const parsed = JSON.parse(cached)

            // 版本檢查
            if (parsed.version !== version) {
                console.info(`Cache version mismatch for ${key}, clearing...`)
                remove(key)
                return null
            }

            return parsed.data
        } catch (e) {
            console.error(`Error reading cache for ${key}:`, e)
            return null
        }
    }

    /**
     * 設定快取資料（永久儲存）
     * @param {string} key - 快取鍵值
     * @param {any} data - 要快取的資料
     * @param {object} metadata - 額外的元資料（如 date, year）
     */
    const set = (key, data, metadata = {}) => {
        if (!isLocalStorageAvailable()) return false

        try {
            const fullKey = getFullKey(key)
            const cacheEntry = {
                data,
                timestamp: Date.now(),
                version,
                ...metadata
            }

            localStorage.setItem(fullKey, JSON.stringify(cacheEntry))
            return true
        } catch (e) {
            console.error(`Error setting cache for ${key}:`, e)

            // 如果是容量超出錯誤，嘗試清除最舊的快取
            if (e.name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded, consider clearing old caches')
            }

            return false
        }
    }

    /**
     * 移除快取
     * @param {string} key - 快取鍵值
     */
    const remove = (key) => {
        if (!isLocalStorageAvailable()) return

        try {
            const fullKey = getFullKey(key)
            localStorage.removeItem(fullKey)
        } catch (e) {
            console.error(`Error removing cache for ${key}:`, e)
        }
    }

    /**
     * 清除所有專案相關快取
     */
    const clear = () => {
        if (!isLocalStorageAvailable()) return

        try {
            const keysToRemove = []

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith(`${prefix}:`)) {
                    keysToRemove.push(key)
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key))
            console.info(`Cleared ${keysToRemove.length} cache entries`)
        } catch (e) {
            console.error('Error clearing cache:', e)
        }
    }

    /**
     * 檢查快取是否存在且有效
     * @param {string} key - 快取鍵值
     * @param {string} date - 可選的日期檢查（YYYY-MM-DD）
     * @returns {boolean}
     */
    const has = (key, date = null) => {
        if (!isLocalStorageAvailable()) return false

        try {
            const fullKey = getFullKey(key)
            const cached = localStorage.getItem(fullKey)

            if (!cached) return false

            const parsed = JSON.parse(cached)

            // 版本檢查
            if (parsed.version !== version) {
                return false
            }

            // 日期檢查（用於當年度快取）
            if (date && parsed.date !== date) {
                return false
            }

            return true
        } catch (e) {
            console.error(`Error checking cache for ${key}:`, e)
            return false
        }
    }

    /**
     * 取得快取的完整資訊（包含 metadata）
     * @param {string} key - 快取鍵值
     * @returns {object|null} - 完整的快取物件或 null
     */
    const getWithMetadata = (key) => {
        if (!isLocalStorageAvailable()) return null

        try {
            const fullKey = getFullKey(key)
            const cached = localStorage.getItem(fullKey)

            if (!cached) return null

            const parsed = JSON.parse(cached)

            // 版本檢查
            if (parsed.version !== version) {
                console.info(`Cache version mismatch for ${key}, clearing...`)
                remove(key)
                return null
            }

            return parsed
        } catch (e) {
            console.error(`Error reading cache metadata for ${key}:`, e)
            return null
        }
    }

    return {
        get,
        set,
        remove,
        clear,
        has,
        getWithMetadata
    }
}
