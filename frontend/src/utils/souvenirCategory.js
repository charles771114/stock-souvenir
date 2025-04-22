export const souvenirCategories = [
  { name: '7-11', keywords: ['7-11', '統一超'] },
  { name: '全家', keywords: ['全家'] },
  { name: '超商卡', keywords: ['商品卡', '禮物卡', '超商'] },
  { name: '餐飲', keywords: ['咖啡', '飲料', '冰袋', '點心', '雞', '蛋'] },
  { name: '日用品', keywords: ['牙膏', '濕紙巾', '洗手乳', '鍋', '刀'] },
  { name: '保健', keywords: ['益生菌', '維他命'] },
  { name: '美妝', keywords: ['面膜', '化妝棉'] },
  { name: '其他', keywords: [] }
]

// 比對分類
export function getSouvenirCategory(souvenir = '') {
  const lower = souvenir.toLowerCase()
  for (const cat of souvenirCategories) {
    if (cat.keywords.some(k => lower.includes(k.toLowerCase()))) {
      return cat.name
    }
  }
  return '其他'
}
