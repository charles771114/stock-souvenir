
import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - 'success', 'error', 'info', 'warning'
     * @param {number} duration - Duration in ms (default 3000)
     * @param {Object} action - Optional action button { label: string, onClick: Function }
     */
    const showToast = (message, type = 'info', duration = 3000, action = null) => {
        const id = toastId++
        const toast = { id, message, type, duration, action }
        toasts.value.push(toast)

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }

    const removeToast = (id) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            toasts.value.splice(index, 1)
        }
    }

    return {
        toasts,
        showToast,
        removeToast
    }
}
