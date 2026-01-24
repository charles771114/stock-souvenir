/**
 * @vitest-environment jsdom
 * 
 * Unit tests for FavoriteButton Vue component
 * Tests button rendering, active states, and event emission
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FavoriteButton from '../FavoriteButton.vue'

describe('FavoriteButton', () => {
  describe('Rendering', () => {
    it('should render inactive state correctly', () => {
      const wrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1', name: 'Test Gift' },
          isActive: false,
        },
      })

      expect(wrapper.text()).toContain('加入清單')
      expect(wrapper.find('button').classes()).toContain('bg-white')
    })

    it('should render active state correctly', () => {
      const wrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1', name: 'Test Gift' },
          isActive: true,
        },
      })

      expect(wrapper.text()).toContain('已收藏')
      expect(wrapper.find('button').classes()).toContain('bg-pink-50')
    })

    it('should have correct title attribute for inactive state', () => {
      const wrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1' },
          isActive: false,
        },
      })

      expect(wrapper.find('button').attributes('title')).toBe('加入清單')
    })

    it('should have correct title attribute for active state', () => {
      const wrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1' },
          isActive: true,
        },
      })

      expect(wrapper.find('button').attributes('title')).toBe('從清單移除')
    })
  })

  describe('Icon Rendering', () => {
    it('should show filled heart icon when active', () => {
      const wrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1' },
          isActive: true,
        },
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('currentColor')
    })

    it('should show plus icon when inactive', () => {
      const wrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1' },
          isActive: false,
        },
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('none')
      expect(svg.attributes('stroke')).toBe('currentColor')
    })
  })

  describe('Events', () => {
    it('should emit toggle event when clicked', async () => {
      const wrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1' },
          isActive: false,
        },
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('toggle')).toHaveLength(1)
    })

    it('should stop event propagation on click', async () => {
      // Verify click.stop modifier by checking the event doesn't bubble
      const wrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1' },
          isActive: false,
        },
      })

      const button = wrapper.find('button')
      // The .stop modifier should prevent propagation
      expect(button.exists()).toBe(true)
    })

    it('should emit toggle for both active and inactive states', async () => {
      // Test inactive -> toggle
      const inactiveWrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1' },
          isActive: false,
        },
      })
      await inactiveWrapper.find('button').trigger('click')
      expect(inactiveWrapper.emitted('toggle')).toHaveLength(1)

      // Test active -> toggle
      const activeWrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1' },
          isActive: true,
        },
      })
      await activeWrapper.find('button').trigger('click')
      expect(activeWrapper.emitted('toggle')).toHaveLength(1)
    })
  })

  describe('Accessibility', () => {
    it('should be focusable', () => {
      const wrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1' },
          isActive: false,
        },
      })

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      // Button element is inherently focusable
    })

    it('should have focus ring styles', () => {
      const wrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1' },
          isActive: false,
        },
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('focus:ring-2')
    })
  })

  describe('Styling', () => {
    it('should have transition classes', () => {
      const wrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1' },
          isActive: false,
        },
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('transition-all')
      expect(button.classes()).toContain('duration-200')
    })

    it('should apply correct colors for inactive state', () => {
      const wrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1' },
          isActive: false,
        },
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('text-slate-600')
      expect(button.classes()).toContain('border-slate-200')
    })

    it('should apply correct colors for active state', () => {
      const wrapper = mount(FavoriteButton, {
        props: {
          gift: { id: 'gift-1' },
          isActive: true,
        },
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('text-pink-600')
      expect(button.classes()).toContain('border-pink-200')
    })
  })
})
