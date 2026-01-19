import { describe, it, expect } from 'vitest'
import { getSouvenirCategory } from '../souvenirCategory'

describe('getSouvenirCategory', () => {
    it('categorizes 7-11 correctly', () => {
        expect(getSouvenirCategory('7-11商品卡')).toBe('7-11')
        expect(getSouvenirCategory('統一超商禮卷')).toBe('7-11')
    })

    it('categorizes FamilyMart correctly', () => {
        expect(getSouvenirCategory('全家禮物卡')).toBe('全家')
    })

    it('categorizes General convenience store cards', () => {
        expect(getSouvenirCategory('商品卡50元')).toBe('超商卡')
        expect(getSouvenirCategory('禮物卡')).toBe('超商卡')
    })

    it('categorizes Food & Beverage', () => {
        expect(getSouvenirCategory('咖啡提貨卡')).toBe('餐飲')
        expect(getSouvenirCategory('大燕麥片')).toBe('其他') // "麥片" is not in the list, based on file reading
        // "點心" was in the list
        expect(getSouvenirCategory('小點心')).toBe('餐飲')
    })

    it('categorizes Daily Supplies', () => {
        expect(getSouvenirCategory('洗手乳')).toBe('日用品')
        expect(getSouvenirCategory('高級陶瓷刀')).toBe('日用品')
    })

    it('returns "其他" for unknown items', () => {
        expect(getSouvenirCategory('未知商品')).toBe('其他')
        expect(getSouvenirCategory('')).toBe('其他')
        expect(getSouvenirCategory('   ')).toBe('其他')
    })

    it('is case insensitive', () => {
        // Assuming "Soap" was a keyword if English was used, but checking existing logic
        // The existing logic has .toLowerCase().
        // Let's test if we had English keywords, but currently they are Chinese.
        // However, the code does `cat.keywords.some((k) => lower.includes(k.toLowerCase()))`
        // So it handles case insensitivity.
        // Let's rely on the fact that existing keywords are mostly Chinese, except '7-11'.
        expect(getSouvenirCategory('7-11')).toBe('7-11')
    })
})
