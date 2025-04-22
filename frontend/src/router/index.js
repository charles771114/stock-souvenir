import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '../layout/index.vue'
import GetGift from '../views/GetGift.vue'
import PdfTransform from '../views/PdfTransform.vue'
import Favorites from '../views/Favorites.vue'
import LoginForm from '../views/LoginForm.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/getGift', // 進入首頁就導向 /getGift
    children: [
      {
        path: 'getGift',
        name: 'GetGift',
        component: GetGift,
        meta: { title: '首頁' }
      },
      {
        path: 'pdfTransform',
        name: 'PdfTransform',
        component: PdfTransform,
        meta: { title: 'PDF 轉換' }
      },
      {
        path: 'favorites',
        name: 'Favorites',
        component: Favorites,
        meta: { title: '收藏' }
      },
      {
        path: 'loginForm',
        name: 'loginForm',
        component: LoginForm,
        meta: { title: '登入' }
      }
    ]
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
