
import { supabase } from '@/lib/supabase'
import { computed, ref } from 'vue'

export function useAdmin() {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchAllUsers = async () => {
    console.log('🔄 Fetching all users...')
    loading.value = true
    error.value = null
    try {
      // Fetch profiles with collection counts
      // Note: added_at is optional - if column doesn't exist, will use created_at as fallback
      const { data, error: err } = await supabase
        .from('profiles')
        .select(`
          id, 
          email, 
          full_name,
          role, 
          created_at, 
          is_primary_admin,
          user_collections(count)
        `)
        .order('created_at', { ascending: false })

      if (err) throw err
      
      console.log('✅ Loaded profiles:', data.length)
      console.table(data.map(u => ({ email: u.email, role: u.role, is_primary: u.is_primary_admin })))

      users.value = data.map(profile => ({
        ...profile,
        is_admin: profile.role === 'admin',
        collection_count: profile.user_collections?.[0]?.count || 0,
        added_at: profile.added_at || profile.created_at // Fallback to created_at
      }))
    } catch (err) {
      console.error('Fetch users error:', err)
    } finally {
      loading.value = false
    }
  }

  const stats = ref({ total: 0, recent: [] })

  const fetchGiftStats = async () => {
    // Implement or mock gift stats fetching
    const { count, error } = await supabase
      .from('souvenirs')
      .select('*', { count: 'exact', head: true })
    if (!error) stats.value.total = count

    // Fetch recent
    const { data } = await supabase
      .from('souvenirs')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5)

    if (data) {
      stats.value.recent = data.map(d => ({
        id: d.id,
        company_name: d.name,
        company_code: d.code,
        gift_name: d.souvenir_item,
        gift_year: d.meeting_date?.substring(0, 4) || 'N/A',
        created_at: d.updated_at || new Date().toISOString()
      }))
    }
  }

  const adminEmails = computed(() => {
    return users.value
      .filter(u => u.role === 'admin')
      .map(u => ({
        ...u,
        email: u.email,
        is_primary_admin: u.is_primary_admin || false,
        added_at: u.added_at || u.created_at
      }))
  })

  return {
    users,
    adminEmails,
    stats,
    loading,
    error,
    fetchAllUsers,
    fetchAdminEmails: fetchAllUsers, // Alias for backward compatibility if needed
    fetchGiftStats,
    addAdminEmail: async (email) => {
      console.log('➕ Adding admin:', email)
      loading.value = true
      error.value = null
      
      try {
        // 1. Find user by email
        const { data: profiles, error: findError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('email', email)
          .maybeSingle()

        if (findError) {
          error.value = findError.message
          loading.value = false
          return { error: findError }
        }
        
        if (!profiles) {
          const notFoundError = new Error('找不到該用戶。請確認 Email 正確且用戶已註冊。')
          error.value = notFoundError.message
          loading.value = false
          return { error: notFoundError }
        }

        if (profiles.role === 'admin') {
          const alreadyAdminError = new Error('該用戶已經是管理員')
          error.value = alreadyAdminError.message
          loading.value = false
          return { error: alreadyAdminError }
        }

        // 2. Update role to admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', profiles.id)

        if (updateError) {
          error.value = updateError.message
          loading.value = false
          return { error: updateError }
        }

        // 3. Force refresh the list
        console.log('✅ Admin added. Refreshing list...')
        await fetchAllUsers()
        
        loading.value = false
        return { error: null }
      } catch (err) {
        console.error('Add admin error:', err)
        error.value = err.message
        loading.value = false
        return { error: err }
      }
    },
    removeAdminEmail: async (email) => {
      loading.value = true
      // 1. Find user by email
      const { data: profiles, error: findError } = await supabase
        .from('profiles')
        .select('id, is_primary_admin')
        .eq('email', email)
        .maybeSingle()

      if (findError || !profiles) {
        loading.value = false
        return { error: findError || new Error('找不到該用戶') }
      }

      // 2. Check if primary admin
      if (profiles.is_primary_admin) {
        loading.value = false
        return { error: new Error('無法移除主管理員權限，請先降級或聯絡系統維護者') }
      }

      // 3. Update role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', profiles.id)

      if (!updateError) {
        await fetchAllUsers() // Refresh list
      }

      loading.value = false
      return { error: updateError }
    },
    promoteToPrimary: async (email) => {
      loading.value = true
      const { data: profiles, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (findError || !profiles) {
        loading.value = false
        return { error: findError || new Error('找不到該用戶') }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_primary_admin: true })
        .eq('id', profiles.id)

      if (!updateError) await fetchAllUsers()

      loading.value = false
      return { error: updateError }
    },
    toggleUserRole: async (userId, newRole) => {
      loading.value = true
      
      // Only update role (added_at column may not exist yet)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (!updateError) {
        await fetchAllUsers() // Refresh list
      }

      loading.value = false
      return { error: updateError }
    }
  }
}
