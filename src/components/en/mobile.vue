<!-- スマホ用 -->
<!-- pc.vueにも同じコードが多いので、統合したい -->
<template>
  <q-layout ref="layout" view="lHh Lpr FFF">
    <q-toolbar slot="header">
      <q-btn flat @click="$refs.layout.toggleLeft()">
        <q-icon name="menu" />
      </q-btn>
      <q-input ref="word" icon="" inverted dark v-model="word" class="no-shadow" placeholder="単語"
        @keydown.enter="word=word.replace(/^\s+|\s+$/g, '');search(word)" autofocus
      />
      <!-- <q-toolbar-title>
        Quasar App
        <div slot="subtitle">Running on Quasar v{{$q.version}}</div>
      </q-toolbar-title> -->
    </q-toolbar>

    <div slot="left">
      <!--
        Use <q-side-link> component
        instead of <q-item> for
        internal vue-router navigation
      -->
      <div>
        <q-toggle class="menu" v-model="en.multiple" label="Multiple" />
      </div>
      <div>
        <q-btn class="menu" outline @click="search(word,true)">Skip Query</q-btn>
      </div>
      <div style="padding-left:20px">
        <q-radio v-for="o in typeOptions" :key="o.value" v-model="en.type" :val="o.value" :label="o.text" />
      </div>
    </div>

     <!--
      Replace following <div> with
      <router-view /> component
      if using subRoutes
    -->
    <router-view></router-view>
    <!-- <q-toolbar slot="footer"> -->
    <q-tabs slot="footer">
      <!-- Tabs - notice slot="title" -->
      <q-route-tab icon="search" to="dictionary" exact slot="title" :count="en.dictionaryList.length">
        <q-inner-loading :visible="en.dictionaryLoading" />
      </q-route-tab>
      <q-route-tab icon="list" to="example" exact slot="title" :count="en.exampleList.length">
        <q-inner-loading :visible="en.exampleLoading" />
      </q-route-tab>
      <q-route-tab icon="audiotrack" to="audio" exact slot="title" :count="en.audioList.length">
        <q-inner-loading :visible="en.audioLoading" />
      </q-route-tab>
      <q-route-tab icon="photo" to="image" exact slot="title">
      </q-route-tab>
    </q-tabs>
    <!-- </q-toolbar> -->
    <q-fixed-position corner="bottom-left" :offset="[14, 10]">
      <q-btn color="secondary" round @click="focusSearch">
        <q-icon name="keyboard arrow up" />
      </q-btn>
    </q-fixed-position>
    <q-fixed-position v-if="en.word" corner="bottom-right" :offset="[14, 10]">
      <q-btn color="secondary" round @click="save">
        <q-icon name="save" />
      </q-btn>
    </q-fixed-position>
    <q-modal ref="duplicateModal" :content-css="{padding: '15px'}">
      <div v-if="en.duplicate" style="padding-bottom: 50px">
        <h4>{{en.duplicate.word}}</h4>
        <h5 v-if="en.duplicate.pron">{{en.duplicate.pron}}</h5>
        <div v-if="en.duplicate.meaning" v-html="en.duplicate.meaning"></div>
      </div>
      <q-fixed-position v-if="" corner="bottom-left" :offset="[18, -40]">
        <q-btn color="primary" round @click="closeDuplicate">
          <q-icon name="close" />
        </q-btn>
      </q-fixed-position>
      <q-fixed-position v-if="" corner="bottom-right" :offset="[90, -40]">
        <q-btn color="primary" round @click="editDuplicate(false)">
          <q-icon name="mode edit" />
        </q-btn>
      </q-fixed-position>
      <q-fixed-position v-if="" corner="bottom-right" :offset="[18, -40]">
        <q-btn color="primary" round @click="editDuplicate(true)">
          <q-icon name="list" />
        </q-btn>
      </q-fixed-position>
    </q-modal>
  </q-layout>
</template>

<script>
import {
  QLayout,
  QToolbar,
  QToolbarTitle,
  QBtn,
  QIcon,
  QList,
  QListHeader,
  QItem,
  QItemSide,
  QItemMain,
  QSearch,
  QTabs,
  QTab,
  QTabPane,
  QRouteTab,
  QInnerLoading,
  QToggle,
  QFixedPosition,
  QRadio,
  QInput,
  QModal
} from 'quasar'
import settings from '@/configs/settings'
import { mapMutations, mapGetters } from 'vuex'
export default {
  name: 'index',
  computed: {
    ...mapGetters(['en'])
  },
  data () {
    return {
      test: null,
      word: '',
      searchedWord: [],
      typeOptions: settings.typeOptions,
      apiUrl: settings.apiUrl
    }
  },
  methods: {
    ...mapMutations([
      'searchEn',
      'resetEn',
      'saveEn'
    ]),
    // 既存単語モーダルを閉じる
    closeDuplicate () {
      this.$refs.duplicateModal.close()
      this.resetEn()
      this.reset()
    },
    // 既存単語の情報を修正
    editDuplicate (searchExample) {
      this.en.dictionaryList.push({
        word: this.en.duplicate.word,
        pron: this.en.duplicate.pron,
        meaning: this.en.duplicate.meaning
      })
      this.$refs.duplicateModal.close()
      this.searchEn({word: this.word, noExample: !searchExample, noAudio: true, cb: null})
    },
    // 既存単語モーダルを開く
    showDuplicate () {
      this.$refs.duplicateModal.open()
    },
    reset () {
      this.word = ''
      this.searchedWord = []
      this.focusSearch()
    },
    save: function () {
      // this.word = ''
      // this.searchedWord = []
      this.saveEn({word: this.word, cb: this.reset})
    },
    search: function (word, skipQuery) {
      // console.log('search', word)
      document.activeElement.blur()
      /* eslint-disable */
      // word = word.replace(/^\s+|\s+$/g, '')
      /* eslint-enable */
      this.resetEn()
      this.searchEn({word: word, noExample: false, noAudio: false, cb: this.showDuplicate, skipQuery: skipQuery})
      this.searchedWord.push(word)
    },
    focusSearch () {
      var searchEl = document.getElementsByClassName('q-input-target')[0]
      searchEl.focus()
      searchEl.setSelectionRange(0, 9999)
    }
  },
  mounted: function () {
    console.log(document.getElementsByClassName('q-input-target'))
    this.focusSearch()
  },
  components: {
    QLayout,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    QList,
    QListHeader,
    QItem,
    QItemSide,
    QItemMain,
    QSearch,
    QTabs,
    QTab,
    QTabPane,
    QRouteTab,
    QInnerLoading,
    QToggle,
    QFixedPosition,
    QRadio,
    QInput,
    QModal
  }
}
</script>

<style>
  .menu {
    margin: 20px;
  }
  .modal-scroll {
    max-height: 450px;
  }

</style>
