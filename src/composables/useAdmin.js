import { supabase } from '@/lib/supabase'
import { computed, ref } from 'vue'

export function useAdmin() {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchAllUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select(`
          id, 
          email, 
          full_name,
          role, 
          created_at, 
          is_primary_admin,
          legacy_names,
          avatar_url,
          user_collections(count),
          portfolios(id, name, is_default)
        `)
        .order('created_at', { ascending: false })

      if (err) throw err

      users.value = data.map(profile => ({
        ...profile,
        is_admin: profile.role === 'admin',
        collection_count: profile.user_collections?.[0]?.count || 0,
        portfolios: profile.portfolios || [],
        added_at: profile.created_at
      }))
    } catch (err) {
      console.error('Fetch users error:', err)
    } finally {
      loading.value = false
    }
  }

  const stats = ref({ total: 0, recent: [] })

  const fetchGiftStats = async () => {
    const { count, error } = await supabase
      .from('souvenirs')
      .select('*', { count: 'exact', head: true })
    if (!error) stats.value.total = count

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
        added_at: u.created_at
      }))
  })

  return {
    users,
    adminEmails,
    stats,
    loading,
    error,
    fetchAllUsers,
    fetchAdminEmails: fetchAllUsers,
    fetchGiftStats,
    addAdminEmail: async (email) => {
      loading.value = true
      error.value = null
      try {
        const { data: profile, error: findError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('email', email)
          .maybeSingle()

        if (findError) throw findError
        if (!profile) throw new Error('找不到該用戶')
        if (profile.role === 'admin') throw new Error('該用戶已經是管理員')

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', profile.id)

        if (updateError) throw updateError
        await fetchAllUsers()
        return { error: null }
      } catch (err) {
        error.value = err.message
        return { error: err }
      } finally {
        loading.value = false
      }
    },
    removeAdminEmail: async (email) => {
      loading.value = true
      try {
        const { data: profile, error: findError } = await supabase
          .from('profiles')
          .select('id, is_primary_admin')
          .eq('email', email)
          .maybeSingle()

        if (findError || !profile) throw findError || new Error('找不到該用戶')
        if (profile.is_primary_admin) throw new Error('無法移除主管理員權限')

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'user' })
          .eq('id', profile.id)

        if (!updateError) await fetchAllUsers()
        return { error: updateError }
      } finally {
        loading.value = false
      }
    },
    promoteToPrimary: async (email) => {
      loading.value = true
      try {
        const { data: profile, error: findError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle()

        if (findError || !profile) throw findError || new Error('找不到該用戶')

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_primary_admin: true })
          .eq('id', profile.id)

        if (!updateError) await fetchAllUsers()
        return { error: updateError }
      } finally {
        loading.value = false
      }
    },
    toggleUserRole: async (userId, newRole) => {
      loading.value = true
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (!updateError) await fetchAllUsers()
      loading.value = false
      return { error: updateError }
    },
    updateProfile: async (userId, updates) => {
      loading.value = true
      error.value = null
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)

        if (updateError) throw updateError
        await fetchAllUsers()
        return { error: null }
      } catch (err) {
        error.value = err.message
        return { error: err }
      } finally {
        loading.value = false
      }
    }
  }
}
