
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function initCategories() {
  console.log('--- Initializing Categories ---');

  const newCategories = [
    { name: '餐廚用具', color: 'yellow', keywords: ['碗', '盤', '碟', '匙', '叉', '杯', '壺', '鍋', '餐具', '保鮮盒', '便當盒', '便當袋', '保冰袋', '保冷袋', '水瓶', '冷水瓶', '冰壩杯', '對杯', '調味罐', '砧板', '料理剪', '廚用組', '不銹鋼', '不鏽鋼', '耐熱', '防燙'] },
    { name: '美容保健', color: 'pink', keywords: ['膠囊', '皂', '洗手', '沐浴', '洗髮', '面膜', '乳液', '凝膠', '牙刷', '洗面', '藥膏', '保健', '益生菌', '維他命', '視泌', '潔顏', '潔面', '潔膚', '潤澤', '化妝水', '靈芝', '樟芝', '舒活皂', '精華液'] },
    { name: '數位配件', color: 'purple', keywords: ['隨身碟', '行動電源', '充電', '線', '適配', '手機架', '支架', '耳機', '滑鼠', '鍵盤', 'LED', '觸控筆', '兩用筆', '快充', '感應燈', '檯燈', '行李秤'] }
  ];

  for (const cat of newCategories) {
    console.log(`Checking/Creating category: ${cat.name}...`);
    const { data: existing } = await supabase.from('souvenir_categories').select('id').eq('name', cat.name).single();
    if (existing) {
      console.log(`Category ${cat.name} already exists. Updating keywords...`);
      await supabase.from('souvenir_categories').update({ keywords: cat.keywords, color: cat.color }).eq('id', existing.id);
    } else {
      console.log(`Creating category ${cat.name}...`);
      await supabase.from('souvenir_categories').insert(cat);
    }
  }

  // Update existing ones with more keywords
  console.log('--- Updating Existing Categories ---');
  const existingUpdates = [
    { name: '生活用品', keywords: ['衛生紙', '牙膏', '毛巾', '襪子', '馬克杯', '面紙', '雨傘', '指甲剪', '口罩', '便利貼', '杯墊', '鑰匙', '發財巾', '手帕', '袋', '手提袋', '帆布袋', '購物袋', '收納袋', '濕巾', '擦手巾', '螺絲組', '束口袋', '毛毯', '蓋毯', '腰包'] },
    { name: '食品', keywords: ['米', '麵', '醬油', '餅乾', '茶', '咖哩', '雞肉鬆', '海苔', '糖', '肉乾', '燕麥', '咖啡', '濾掛', '調味料'] },
    { name: '廚房清潔', keywords: ['洗碗精', '洗衣精', '肥皂', '香皂', '清潔劑', '菜瓜布', '洗衣球', '除霉', '小蘇打', '洗潔精', '洗滌液', '清潔品', '鎖鮮袋'] }
  ];

  for (const up of existingUpdates) {
    const { data: existing } = await supabase.from('souvenir_categories').select('id, keywords').eq('name', up.name).single();
    if (existing) {
      const mergedKeywords = [...new Set([...(existing.keywords || []), ...up.keywords])];
      console.log(`Updating ${up.name} with ${mergedKeywords.length} keywords.`);
      await supabase.from('souvenir_categories').update({ keywords: mergedKeywords }).eq('id', existing.id);
    }
  }

  console.log('--- Done ---');
}

initCategories();
