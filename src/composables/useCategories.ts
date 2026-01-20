import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Category {
    id: number
    name: string
    keywords: string[]
    color: string
}

export function useCategories() {
    const categories = ref<Category[]>([])
    const loading = ref(false)

    // Fetch all categories
    const fetchCategories = async () => {
        loading.value = true
        const { data, error } = await supabase
            .from('souvenir_categories')
            .select('*')
            .order('sort_order', { ascending: true })

        if (data) {
            categories.value = data
        }
        loading.value = false
        return { data, error }
    }

    // Create a new category
    const createCategory = async (category: Omit<Category, 'id'>) => {
        const { data, error } = await supabase
            .from('souvenir_categories')
            .insert(category)
            .select()
            .single()

        if (data) {
            categories.value.push(data)
        }
        return { data, error }
    }

    // Update a category
    const updateCategory = async (id: number, updates: Partial<Category>) => {
        const { data, error } = await supabase
            .from('souvenir_categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (data) {
            const index = categories.value.findIndex(c => c.id === id)
            if (index !== -1) categories.value[index] = data
        }
        return { data, error }
    }

    // Match a souvenir name to a category
    const matchCategory = (souvenirName: string): { id: number | null, status: 'system_matched' | 'unclassified' } => {
        if (!souvenirName) return { id: null, status: 'unclassified' }

        for (const cat of categories.value) {
            if (cat.keywords && Array.isArray(cat.keywords)) {
                // Check if any keyword matches
                // Using partial match
                const matched = cat.keywords.some(k => souvenirName.includes(k))
                if (matched) {
                    return { id: cat.id, status: 'system_matched' }
                }
            }
        }

        return { id: null, status: 'unclassified' }
    }

    return {
        categories,
        loading,
        fetchCategories,
        createCategory,
        updateCategory,
        matchCategory
    }
}
