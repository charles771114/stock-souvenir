import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/lib/supabase'
import { ref } from 'vue'

export function useCollection() {
    const collection = ref([])
    const loading = ref(false)
    const error = ref(null)

    const { user } = useAuth()

    const fetchAllInventory = async () => {
        if (!user.value) return

        loading.value = true
        error.value = null

        try {
            const { data, error: fetchError } = await supabase
                .from('user_collections')
                .select(`
          *,
          souvenir: souvenirs (*)
        `)
                .eq('user_id', user.value.id)
                .eq('status', 'collected') // Specifically for inventory (owned items)
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            collection.value = data
        } catch (err) {
            console.error('Fetch inventory failed:', err)
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const fetchCollection = async () => {
        if (!user.value) return

        loading.value = true
        error.value = null

        try {
            const { data, error: fetchError } = await supabase
                .from('user_collections')
                .select(`
          *,
          souvenir: souvenirs (*)
        `)
                .eq('user_id', user.value.id)
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
        if (!user.value) {
            // Using a simple alert is not ideal for UX, consider returning error object
            return { success: false, error: '請先登入' }
        }

        try {
            const { error: insertError } = await supabase
                .from('user_collections')
                .upsert({
                    user_id: user.value.id,
                    souvenir_id: souvenirId,
                    quantity,
                    note,
                    status: 'collected'
                }, { onConflict: 'user_id, souvenir_id' })

            if (insertError) throw insertError

            await fetchAllInventory() // Reload inventory
            return { success: true }
        } catch (err) {
            console.error('Add to collection failed:', err)
            return { success: false, error: err.message }
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
            return { success: true }
        } catch (err) {
            console.error('Remove from collection failed:', err)
            return { success: false, error: err.message }
        }
    }

    const clearAllCollections = async () => {
        if (!user.value) {
            return { success: false, error: '請先登入' }
        }

        try {
            const { error: deleteError } = await supabase
                .from('user_collections')
                .delete()
                .eq('user_id', user.value.id)

            if (deleteError) throw deleteError

            collection.value = []
            return { success: true }
        } catch (err) {
            console.error('Clear all collections failed:', err)
            return { success: false, error: err.message }
        }
    }

    return {
        collection,
        loading,
        error,
        fetchCollection, // Keep for backward compatibility
        fetchAllInventory, // New explicit function
        addToCollection,
        removeFromCollection,
        clearAllCollections
    }
}
