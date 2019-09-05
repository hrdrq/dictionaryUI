<!-- スマホ用 -->
<!-- pc.vueにも同じコードが多いので、統合したい -->
<template>
  <q-layout ref="layout" view="lHh Lpr FFF">
    <q-toolbar slot="header">
      <q-btn flat @click="$refs.layout.toggleLeft()">
        <q-icon name="menu" />
      </q-btn>
      <q-input ref="word" icon="" inverted dark v-model="word" class="no-shadow" placeholder="単語" 
        @keydown.enter="word=word.replace(/[ 　]/g, '');search(word)" autofocus
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
        <q-toggle class="menu" v-model="ja.multiple" label="複数" />
      </div>
      <div>
        <q-btn class="menu" outline @click="search(word,true)">Skip Query</q-btn>
      </div>
      <div style="padding-left:20px">
        <q-radio v-for="o in typeOptions" :key="o.value" v-model="ja.type" :val="o.value" :label="o.text" />
      </div>
      <div style="padding:0 20px 0 20px">
        <q-input v-model="alternativeWord" float-label="代替検索" :after="[{icon: 'arrow_forward', handler () {alternativeSearch(alternativeWord)}}]" @keydown.enter="alternativeSearch(alternativeWord)" />
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
      <q-route-tab icon="search" to="dictionary" exact slot="title" :count="ja.dictionaryList.length">
        <q-inner-loading :visible="ja.dictionaryLoading" />
      </q-route-tab>
      <q-route-tab icon="audiotrack" to="audio" exact slot="title" :count="ja.audioList.length">
        <q-inner-loading :visible="ja.audioLoading" />
      </q-route-tab>
      <q-route-tab icon="star border" to="chinese" exact slot="title" :count="ja.chineseList.length">
        <q-inner-loading :visible="ja.chineseLoading" />
      </q-route-tab>
      <q-route-tab icon="list" to="example" exact slot="title" :count="ja.exampleList.length">
        <q-inner-loading :visible="ja.exampleLoading" />
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
    <q-fixed-position v-if="ja.word" corner="bottom-right" :offset="[14, 10]">
      <q-btn color="secondary" round @click="save">
        <q-icon name="save" />
      </q-btn>
    </q-fixed-position>
    <q-modal ref="duplicateModal" :content-css="{padding: '15px'}">
      <div v-if="ja.duplicate" style="padding-bottom: 50px">
        <h4>{{ja.duplicate.word}}</h4>
        <h5 v-if="ja.duplicate.kana" class="kana" v-html="rubyKanaHtml(ja.duplicate.kana, ja.duplicate.accent)"></h5>
        <h5 v-if="ja.duplicate.gogen">{{ja.duplicate.gogen}}</h5>
        <div v-if="ja.duplicate.meaning" v-html="ja.duplicate.meaning"></div>
        <div v-if="ja.duplicate.chinese" v-html="ja.duplicate.chinese"></div>
      </div>
      <q-fixed-position v-if="" corner="bottom-left" :offset="[18, -40]">
        <q-btn color="primary" round @click="closeDuplicate">
          <q-icon name="close" />
        </q-btn>
      </q-fixed-position>
      <q-fixed-position v-if="" corner="bottom-right" :offset="[162, -40]">
        <q-btn color="primary" round @click="addAlternativeWord">
          <q-icon name="add" />
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
  Dialog,
  Toast,
  Loading,
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
import axios from 'axios'
export default {
  name: 'index',
  computed: {
    ...mapGetters(['ja'])
  },
  data () {
    return {
      test: null,
      word: '',
      alternativeWord: '',
      searchedWord: [],
      typeOptions: settings.typeOptions,
      apiUrl: settings.apiUrl
    }
  },
  methods: {
    ...mapMutations([
      'searchJa',
      'resetJa',
      'saveJa'
    ]),
    // 単語を参照単語として保存する
    addAlternativeWord () {
      var dialog = null
      var doAdd = data => {
        console.log('wordToAdd', data.wordToAdd)
        Loading.show()
        axios.post(this.apiUrl + 'ja/save/add-alternative-word', {
          word: data.wordToAdd,
          detail_id: this.ja.duplicate.id
        }).then(response => {
          Loading.hide()
          console.log(dialog)
          if (response.data.status !== 'success') {
            Toast.create({
              html: response.data.error_detail,
              timeout: 1500
            })
          }
          else {
            console.log('add success')
          }
        })
      }
      dialog = Dialog.create({
        title: '代替追加',
        form: {
          wordToAdd: {
            type: 'text'
          }
        },
        buttons: [
          'Cancel',
          {
            label: 'Ok',
            handler: doAdd
          }
        ]
      })
    },
    // 既存単語モーダルを閉じる
    closeDuplicate () {
      this.$refs.duplicateModal.close()
      this.resetJa()
      this.reset()
    },
    // 既存単語の情報を修正
    editDuplicate (searchExample) {
      this.ja.dictionaryList.push({
        word: this.ja.duplicate.word,
        kana: this.ja.duplicate.kana,
        accent: this.ja.duplicate.accent ? this.ja.duplicate.accent.split(',') : [],
        gogen: this.ja.duplicate.gogen,
        meaning: this.ja.duplicate.meaning
      })
      this.ja.chineseList.push({
        kanji: this.ja.duplicate.word,
        kana: this.ja.duplicate.kana,
        meaning: this.ja.duplicate.chinese
      })
      this.$refs.duplicateModal.close()
      this.searchJa({word: this.word, noExample: !searchExample, noAudio: true, cb: null})
    },
    // 既存単語モーダルを開く
    showDuplicate () {
      this.$refs.duplicateModal.open()
    },
    reset () {
      this.word = ''
      this.alternativeWord = ''
      this.searchedWord = []
      this.focusSearch()
    },
    save: function () {
      // this.word = ''
      // this.alternativeWord = ''
      // this.searchedWord = []
      this.saveJa(this.reset)
    },
    search: function (word, skipQuery) {
      // console.log('search', word)
      document.activeElement.blur()
      /* eslint-disable */
      word = word.replace(/[ 　]/g, '')
      /* eslint-enable */
      this.resetJa()
      this.searchJa({word: word, noExample: false, noAudio: false, cb: this.showDuplicate, skipQuery: skipQuery})
      this.searchedWord.push(word)
    },
    alternativeSearch (word) {
      if (this.searchedWord.includes[word]) {
        return
      }
      this.searchJa({word: word, noExample: false, noAudio: false, cb: null, skipQuery: true, alternative: true})
      this.searchedWord.push(word)
    },
    // アクセントの情報でruby化
    rubyKanaHtml: function (k, a) {
      if (!a || a === '') {
        return k
      }
      var result = ''
      var kanas = k.split(';')
      var accents = a.split(';')
      for (var i = 0; i < kanas.length; i++) {
        var kana = kanas[i]
        var accent = accents[i]
        var div = document.createElement('div')
        var pitches = accent.split(',')
        pitches.forEach(a => {
          var moras = kana.split(/(?![ゃゅょぁぃぅぇぉャュョァィゥェォ])/)
          if (a > 0) {
            moras[a - 1] = '<b>' + moras[a - 1] + '</b>'
          }
          var l = a > 0 ? a - 2 : moras.length - 1
          if (l > 0) {
            moras[l] += '</i>'
            moras[1] = '<i>' + moras[1]
          }
          div.innerHTML += moras.join('') + '　'
        })
        div.innerHTML = div.innerHTML.slice(0, -1)
        result += div.outerHTML
      }
      return result
    },
    focusSearch () {
      var searchEl = document.getElementsByClassName('q-input-target')[1]
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
  .kana {
    margin-right: 10px;
    /*color: #1c305c;*/
  }
  .kana div {
    margin-top: 5px;
  }
  .kana i {
    font-style: normal;
    /*text-decoration: overline;*/
    border-top: solid 0.12em;
  }
  .kana b {
    padding-right: 0.12em;
    font-weight: normal;
    /*text-decoration: overline;*/
    border-top: solid 0.12em;
    color: #dc143c;
    background-image: url('data:image/gif;base64,R0lGODlhAQABAPAAANwUPP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==');
    background-size: 0.12em 0.36em;
    background-repeat: no-repeat;
    background-position: right top;
  }
</style>
