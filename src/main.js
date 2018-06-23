// 使ったもの：
// Vue.js
// vue shortkey：ショートカットキー追加用
// Quasar：モバイルUIフレームワーク
// Froala Editor：WYSIWYGエディター。情報を編集用

import Vue from 'vue'
import Quasar from 'quasar'
import VueFroala from 'vue-froala-wysiwyg'
import 'quasar-extras/material-icons'

import router from 'configs/router'
import axios from 'configs/axios'
import store from 'configs/store'

require(`quasar/dist/quasar.${__THEME}.css`)
require('froala-editor/js/froala_editor.pkgd.min')
require('froala-editor/css/froala_editor.pkgd.min.css')
require('font-awesome/css/font-awesome.css')
require('froala-editor/css/froala_style.min.css')

Vue.config.productionTip = false
Vue.use(Quasar)
Vue.use(axios)
Vue.use(VueFroala)
Vue.use(require('vue-shortkey'))

if (__THEME === 'mat') {
  require('quasar-extras/roboto-font')
}

Quasar.start(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#q-app',
    router,
    store,
    render: h => h(require('./App'))
  })
})
