
import { ref } from 'vue'

const state = ref({
    visible: false,
    title: '',
    message: '',
    confirmText: '確定',
    cancelText: '取消',
    type: 'info' // info, danger
})

let resolvePromise = null

export function useDialog() {
    const confirm = (message, title = '確認', options = {}) => {
        state.value = {
            visible: true,
            message,
            title,
            confirmText: options.confirmText || '確定',
            cancelText: options.cancelText || '取消',
            type: options.type || 'info'
        }

        return new Promise((resolve) => {
            resolvePromise = resolve
        })
    }

    const handleConfirm = () => {
        state.value.visible = false
        if (resolvePromise) resolvePromise(true)
    }

    const handleCancel = () => {
        state.value.visible = false
        if (resolvePromise) resolvePromise(false)
    }

    return {
        state,
        confirm,
        handleConfirm,
        handleCancel
    }
}
