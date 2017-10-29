import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

function load (component) {
  return () => System.import(`components/${component}.vue`)
}

export default new VueRouter({
  /*
   * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
   * it is only to be used only for websites.
   *
   * If you decide to go with "history" mode, please also open /config/index.js
   * and set "build.publicPath" to something other than an empty string.
   * Example: '/' instead of current ''
   *
   * If switching back to default "hash" mode, don't forget to set the
   * build publicPath back to '' so Cordova builds work again.
   */

  routes: [
    { path: '/', component: load('ja/pc') },
    {
      path: '/ja/mobile',
      component: load('ja/mobile'),
      children: [
        { path: 'dictionary', component: load('ja/DictionaryPart') },
        { path: 'audio', component: load('ja/AudioPart') },
        { path: 'chinese', component: load('ja/ChinesePart') },
        { path: 'example', component: load('ja/ExamplePart') },
        { path: 'image', component: load('ja/ImagePart') }
      ]
    },
    {
      path: '/ja/pc',
      component: load('ja/pc')
    },
    {
      path: '/ja/example',
      component: load('ja/example')
    },
    { path: '*', component: load('Error404') } // Not found
  ]
})
