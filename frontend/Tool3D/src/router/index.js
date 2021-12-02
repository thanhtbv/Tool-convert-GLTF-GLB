import Vue from 'vue'
import Router from 'vue-router'
import UserPage from '@/components/UserPage'
import Image3DView from '@/components/Image3DView'
import ListImages from '@/components/ListImages'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'UserPage',
      component: UserPage
    },
    {
      path: '/images/list/:id',
      name: 'ListImages',
      component: ListImages
    },
    {
      path: '/images/3d/:id',
      name: 'Image3DView',
      component: Image3DView
    }
  ]
})
