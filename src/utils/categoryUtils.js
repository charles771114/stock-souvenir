/**
 * Centralized utility for souvenir category related logic
 */

export const categoryIcons = {
  '食品': 'ri-restaurant-line',
  '生活用品': 'ri-home-heart-line',
  '廚房清潔': 'ri-dishtowel-line',
  '超商商品卡': 'ri-coupon-3-line',
  '醫療保健': 'ri-capsule-line',
  '休閒育樂': 'ri-moped-line',
  '其他': 'ri-more-fill'
}

/**
 * Returns the Remix Icon class for a given category name
 */
export function getCategoryIcon(name) {
  return categoryIcons[name] || 'ri-bookmark-line'
}

/**
 * Returns Tailwind classes for category badges/borders based on color name
 */
export function getCategoryStyles(color) {
  const badgeClasses = {
    gray: 'text-gray-600 bg-gray-50 border-gray-100',
    red: 'text-red-700 bg-red-50 border-red-100',
    yellow: 'text-yellow-700 bg-yellow-50 border-yellow-100',
    green: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-700 bg-blue-50 border-blue-100',
    indigo: 'text-indigo-700 bg-indigo-50 border-indigo-100',
    purple: 'text-purple-700 bg-purple-50 border-purple-100',
    pink: 'text-pink-700 bg-pink-50 border-pink-100',
  }

  const borderClasses = {
    gray: 'bg-gray-400',
    red: 'bg-red-400',
    yellow: 'bg-yellow-400',
    green: 'bg-emerald-400',
    blue: 'bg-blue-400',
    indigo: 'bg-indigo-400',
    purple: 'bg-purple-400',
    pink: 'bg-pink-400',
  }

  const tabClasses = {
    gray: 'bg-slate-800 text-white border-slate-900 shadow-xl shadow-slate-100',
    red: 'bg-rose-500 text-white border-rose-600 shadow-xl shadow-rose-100 ring-4 ring-rose-500/10',
    yellow: 'bg-amber-400 text-amber-950 border-amber-500 shadow-xl shadow-amber-100 ring-4 ring-amber-500/10',
    green: 'bg-emerald-500 text-white border-emerald-600 shadow-xl shadow-emerald-100 ring-4 ring-emerald-500/10',
    blue: 'bg-blue-500 text-white border-blue-600 shadow-xl shadow-blue-100 ring-4 ring-blue-500/10',
    indigo: 'bg-indigo-500 text-white border-indigo-600 shadow-xl shadow-indigo-100 ring-4 ring-indigo-500/10',
    purple: 'bg-purple-500 text-white border-purple-600 shadow-xl shadow-purple-100 ring-4 ring-purple-500/10',
    pink: 'bg-pink-500 text-white border-pink-600 shadow-xl shadow-pink-100 ring-4 ring-pink-500/10',
  }

  return {
    badge: badgeClasses[color] || badgeClasses.gray,
    border: borderClasses[color] || borderClasses.gray,
    tab: tabClasses[color] || tabClasses.gray
  }
}
