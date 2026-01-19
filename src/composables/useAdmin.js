
import { ref } from 'vue'
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
        .select('id, email, role, created_at')
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

  return {
    users,
    stats,
    loading,
    error,
    fetchAllUsers,
    fetchAdminEmails: fetchAllUsers, // Alias for backward compatibility if needed
    fetchGiftStats
  }
}
