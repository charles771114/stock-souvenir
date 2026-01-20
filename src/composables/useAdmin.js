
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

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
        .select('id, email, role, created_at, is_primary_admin')
        .order('created_at', { ascending: false })

      if (err) throw err

      users.value = data.map(profile => ({
        ...profile,
        is_admin: profile.role === 'admin'
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

  const adminEmails = computed(() => users.value.filter(u => u.is_admin))

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
      loading.value = true
      // 1. Find user by email
      const { data: profiles, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (findError || !profiles) {
        loading.value = false
        return { error: findError || new Error('找不到該用戶') }
      }

      // 2. Update role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', profiles.id)

      if (!updateError) {
        await fetchAllUsers() // Refresh list
      }

      loading.value = false
      return { error: updateError }
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
    }
  }
}
