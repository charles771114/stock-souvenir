import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useAdmin() {
  const users = ref([])
  const adminEmails = ref([])
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * 取得所有用戶列表
   */
  const fetchAllUsers = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles') // Updated: users -> profiles
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Map profiles to users structure expected by frontend if needed
      // Adding is_admin flag based on role
      const mappedUsers = (data || []).map(u => ({
        ...u,
        is_admin: u.role === 'admin'
      }))

      users.value = mappedUsers
      return { data: mappedUsers, error: null }
    } catch (e) {
      console.error('取得用戶列表失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 取得 admin 白名單
   * Note: With the new role-based system, we might query profiles with role='admin'
   * unless 'admin_emails' table is still explicitly used for whitelist management.
   * Assuming we stick to the new role system found in 'profiles', we can filter users.
   * But keeping this if the table exists for legacy whitelist support or strict access control.
   * Based on migration, 'admin_emails' table wasn't in the new schema, so this might be obsolete.
   * We will query profiles with role 'admin' instead.
   */
  const fetchAdminEmails = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'admin')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      adminEmails.value = data || []
      return { data, error: null }
    } catch (e) {
      console.error('取得 admin 名單失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 新增 admin
   * @param {string} email - Email 地址
   */
  const addAdminEmail = async (email) => {
    // This logic changes: we now need to find a profile by email and update role.
    // However, if the user hasn't signed up, we can't update profiles.
    // For now, let's assume we update an existing user's role.
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登入')

      // Find user by email (This might require an RPC or public email column)
      // Assuming public profiles have email as per schema
      const { data: targetUser, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (findError || !targetUser) throw new Error('找不到該 Email 的用戶，請確認用戶已註冊')

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', targetUser.id)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchAllUsers()
      await fetchAdminEmails()

      return { data, error: null }
    } catch (e) {
      console.error('新增 admin 失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 移除 admin
   * @param {string} email - Email 地址
   */
  const removeAdminEmail = async (email) => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登入')

      if (user.email === email) {
        throw new Error('不能移除自己的 admin 權限')
      }

      const { data: targetUser, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (findError) throw findError

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', targetUser.id)

      if (updateError) throw updateError

      await fetchAllUsers()
      await fetchAdminEmails()

      return { error: null }
    } catch (e) {
      console.error('移除 admin 失敗:', e)
      error.value = e.message
      return { error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 取得紀念品統計
   */
  const fetchGiftStats = async () => {
    loading.value = true
    error.value = null

    try {
      // 總數
      const { count: totalCount, error: countError } = await supabase
        .from('souvenirs') // Updated: gift_catalog -> souvenirs
        .select('*', { count: 'exact', head: true })

      if (countError) throw countError

      // 統計各年份數量 (Using meeting_date to extract year)
      // Since we don't have a direct 'year' column and SQL extraction might be complex here without view,
      // we'll fetch meeting_date and process locally for this stats view.
      // Optimally, create a DB View for stats.
      const { data: allGifts, error: fetchError } = await supabase
        .from('souvenirs')
        .select('meeting_date, souvenir_item')

      if (fetchError) throw fetchError

      const yearCounts = {}
      const itemCounts = {} // replacing category since category is removed

      allGifts.forEach(item => {
        if (item.meeting_date) {
          const year = item.meeting_date.split('-')[0]
          yearCounts[year] = (yearCounts[year] || 0) + 1
        }

        // Simple item grouping as a proxy for category stats if needed
        // or just skip category stats if not applicable
      })

      // 最近新增
      const { data: recentGifts, error: recentError } = await supabase
        .from('souvenirs')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5)

      if (recentError) throw recentError

      // Map to frontend expected names
      const mappedRecent = recentGifts.map(g => ({
        ...g,
        company_name: g.name,
        company_code: g.code,
        gift_name: g.souvenir_item,
        gift_year: g.meeting_date ? g.meeting_date.split('-')[0] : 'N/A'
      }))

      stats.value = {
        total: totalCount,
        byYear: yearCounts,
        byCategory: {}, // Category field removed
        recent: mappedRecent,
      }

      return { data: stats.value, error: null }
    } catch (e) {
      console.error('取得統計資料失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 取得用戶收藏統計
   * (Skipping view 'user_collection_stats' as it might not be migrated yet or needs recreation.
   *  If it exists in the new schema plan, we can use it. The plan mentioned creating a View.)
   */
  const fetchUserCollectionStats = async () => {
    // Requires recreating the view in DB migration first if not present
    return { data: [], error: null }
  }

  /**
   * 刪除紀念品
   * @param {string} giftId - 紀念品 ID
   */
  const deleteGift = async (giftId) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('souvenirs')
        .delete()
        .eq('id', giftId)

      if (deleteError) throw deleteError

      return { error: null }
    } catch (e) {
      console.error('刪除紀念品失敗:', e)
      error.value = e.message
      return { error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新紀念品
   * @param {string} giftId - 紀念品 ID
   * @param {Object} updates - 更新資料
   */
  const updateGift = async (giftId, updates) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('souvenirs')
        .update(updates)
        .eq('id', giftId)
        .select()
        .single()

      if (updateError) throw updateError

      return { data, error: null }
    } catch (e) {
      console.error('更新紀念品失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    adminEmails,
    stats,
    loading,
    error,
    fetchAllUsers,
    fetchAdminEmails,
    addAdminEmail,
    removeAdminEmail,
    fetchGiftStats,
    fetchUserCollectionStats,
    deleteGift,
    updateGift,
  }
}
