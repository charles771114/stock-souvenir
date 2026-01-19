
import { ref } from 'vue'

const isOpen = ref(false)

export function useAuthModal() {
    const openAuthModal = () => {
        isOpen.value = true
    }

    const closeAuthModal = () => {
        isOpen.value = false
    }

    return {
        isOpen,
        openAuthModal,
        closeAuthModal
    }
}
