import { supabase } from '@/lib/supabase'
import { computed, ref, watch } from 'vue'
import { useAuth } from './useAuth'

const portfolios = ref([])
const currentPortfolioId = ref(localStorage.getItem('selected_portfolio_id') || null)
const loading = ref(false)
const error = ref(null)

export function usePortfolio() {
  const { user } = useAuth()

  const isCombinedView = computed(() => currentPortfolioId.value === 'combined')
  
  const currentPortfolio = computed(() => {
    if (isCombinedView.value) return null
    return portfolios.value.find(p => p.id === currentPortfolioId.value) || portfolios.value.find(p => p.is_default)
  })

  const fetchPortfolios = async () => {
    if (!user.value) return
    
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('portfolios')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name')
      
      if (fetchError) throw fetchError
      
      portfolios.value = data || []
      
      // If no portfolio matches current selection, default to the 'is_default' one
      if (currentPortfolioId.value && currentPortfolioId.value !== 'combined' && !portfolios.value.some(p => p.id === currentPortfolioId.value)) {
        const defaultP = portfolios.value.find(p => p.is_default)
        if (defaultP) {
          selectPortfolio(defaultP.id)
        }
      } else if (!currentPortfolioId.value && portfolios.value.length > 0) {
        const defaultP = portfolios.value.find(p => p.is_default)
        if (defaultP) {
          selectPortfolio(defaultP.id)
        }
      }
    } catch (e) {
      console.error('Fetch portfolios failed:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const selectPortfolio = (id) => {
    currentPortfolioId.value = id
    if (id) {
      localStorage.setItem('selected_portfolio_id', id)
    } else {
      localStorage.removeItem('selected_portfolio_id')
    }
  }

  const addPortfolio = async (name) => {
    if (!user.value) return
    
    try {
      const { data, error: insertError } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.value.id,
          name,
          is_default: portfolios.value.length === 0
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      
      portfolios.value.push(data)
      return { data, error: null }
    } catch (e) {
      return { data: null, error: e }
    }
  }

  // Auto fetch when user changes
  watch(() => user.value?.id, (newId) => {
    if (newId) {
      fetchPortfolios()
    } else {
      portfolios.value = []
      currentPortfolioId.value = null
    }
  }, { immediate: true })

  return {
    portfolios,
    currentPortfolioId,
    currentPortfolio,
    isCombinedView,
    loading,
    error,
    fetchPortfolios,
    selectPortfolio,
    addPortfolio
  }
}
