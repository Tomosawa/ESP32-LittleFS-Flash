import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import FlashPage from '../components/Flash.vue'
import HomePage from '../components/Home.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage
    },
    {
      path: '/flash',
      name: 'Flash',
      component: FlashPage
    }
  ]
})

export default router
