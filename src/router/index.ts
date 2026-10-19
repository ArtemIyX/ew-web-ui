import { createRouter, createWebHashHistory } from 'vue-router'
import DebugView from '@/views/DebugView/DebugView.vue'
import ColorsView from '@/views/ColorsView/ColorsView.vue'

const router = createRouter({
  history: createWebHashHistory(
    window.location.protocol === 'file:' ? import.meta.env.BASE_URL : '/',
  ),
  routes: [
    { path: '/', redirect: { name: 'menu-connect' } },
    { path: '/menu', name: 'menu', component: () => import('@/views/menu/MenuLayout/MenuLayout.vue'), children: [
      { path: '', name: 'menu-connect', component: () => import('@/views/menu/MenuConnectView/MenuConnectView.vue') },
      { path: 'select-hero', name: 'menu-select-hero', component: () => import('@/views/menu/MenuSelectHeroView/MenuSelectHeroView.vue') },
      { path: 'create-character', name: 'menu-create-character', component: () => import('@/views/menu/MenuCreateCharacterView/MenuCreateCharacterView.vue') },
    ] },
    { path: '/debug', redirect: '/components' },
    { path: '/components', name: 'components', component: DebugView },
    { path: '/colors', name: 'colors', component: ColorsView },
    { path: '/game', name: 'game-hud', component: () => import('@/views/game/GameHudView/GameHudView.vue') },
  ],
})

export default router
