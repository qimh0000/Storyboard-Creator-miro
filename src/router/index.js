// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import PromptEdit from '../page/PromptEdit.vue'

const routes = [

    {
        path: '/promptEdit',
        name: 'PromptEdit',
        component: PromptEdit
    }
]

const router = createRouter({ history: createWebHistory(), routes })
export default router
