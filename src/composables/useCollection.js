import { ref } from 'vue'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'

export function useCollection() {
    const collection = ref([])
    const loading = ref(false)
    const error = ref(null)

    const authStore = useAuthStore()

    const fetchCollection = async () => {
        if (!authStore.user) return

        loading.value = true
        error.value = null

        try {
            const { data, error: fetchError } = await supabase
                .from('user_collections')
                .select(`
          *,
          souvenir: souvenirs (*)
        `)
                .eq('user_id', authStore.user.id)
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            collection.value = data
        } catch (err) {
            console.error('Fetch collection failed:', err)
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const addToCollection = async (souvenirId, quantity = 1, note = '') => {
        if (!authStore.user) {
            alert('請先登入')
            return
        }

        try {
            const { error: insertError } = await supabase
                .from('user_collections')
                .upsert({
                    user_id: authStore.user.id,
                    souvenir_id: souvenirId,
                    quantity,
                    note,
                    status: 'collected'
                }, { onConflict: 'user_id, souvenir_id' })

            if (insertError) throw insertError

            await fetchCollection() // Reload
            return true
        } catch (err) {
            console.error('Add to collection failed:', err)
            alert('加入收藏失敗: ' + err.message)
            return false
        }
    }

    const removeFromCollection = async (collectionId) => {
        try {
            const { error: deleteError } = await supabase
                .from('user_collections')
                .delete()
                .eq('id', collectionId)

            if (deleteError) throw deleteError

            collection.value = collection.value.filter(item => item.id !== collectionId)
        } catch (err) {
            console.error('Remove from collection failed:', err)
            alert('刪除失敗: ' + err.message)
        }
    }

    return {
        collection,
        loading,
        error,
        fetchCollection,
        addToCollection,
        removeFromCollection
    }
}
