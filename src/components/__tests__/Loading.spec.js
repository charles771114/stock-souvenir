import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Loading from '../Loading.vue'

describe('Loading.vue', () => {
    it('renders correctly with Pinia', () => {
        const pinia = createPinia()
        setActivePinia(pinia)

        const wrapper = mount(Loading, {
            global: {
                plugins: [pinia]
            },
            props: {
                text: '載入中...',
            }
        })

        // Basic smoke test: Component mounts successfully
        expect(wrapper.exists()).toBe(true)
    })
})
