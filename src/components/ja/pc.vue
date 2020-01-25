<!-- パソコンとGoogle Chrome拡張機能用 -->
<!-- mobile.vueにも同じコードが多いので、統合したい -->
<template>
  <q-layout ref="layout" view="lHh Lpr FFF">
    <div class="row">
      <div class="col"><q-input v-model="word" placeholder="単語" @keydown.enter="word=word.replace(/[ 　]/g, '');search(word)" autofocus /></div>
      <div class="col"><q-input v-model="alternativeWord" placeholder="代替検索" @keydown.enter="alternativeSearch(alternativeWord)" /></div>
      <div class="col">
        <q-toggle class="menu" v-model="ja.multiple" label="複数" />
        <q-btn color="white" class="text-black" @click="search(word,true)">SQ</q-btn>
        <span v-shortkey="['meta', 'd']" @shortkey="openImage"/>
        <span v-shortkey="['meta', 's']" @shortkey="save"/>
      </div>
      <div class="col" style="padding-top: 20px"><q-radio v-for="o in typeOptions" :key="o.value" v-model="ja.type" :val="o.value" :label="o.text" /></div>
    </div>
    <div class="row">
      <div class="col part"><dictionary-part></dictionary-part><div class="relative-position part"><q-inner-loading :visible="ja.dictionaryLoading" /></div></div>
      <div class="col part"><chinese-part></chinese-part><div class="relative-position part"><q-inner-loading :visible="ja.chineseLoading" /></div></div>
      <div class="col part">
        <q-infinite-scroll :handler="refresher" inline style="height: 100vh; overflow: auto">
          <example-part></example-part>
        </q-infinite-scroll>
        <div class="relative-position part"><q-inner-loading :visible="ja.exampleLoading" /></div>
      </div>
      <div class="col part"><audio-part></audio-part><div class="relative-position part"><q-inner-loading :visible="ja.audioLoading||ja.forvoLoading" /></div></div>
    </div>
    <q-modal ref="imageModal" :content-css="{padding: '15px'}">
      <image-part ref="image_part"></image-part>
    </q-modal>
    <q-modal maximized ref="duplicateModal" @escape-key="closeDuplicate" :content-css="{padding: '15px'}">
      <div v-if="ja.duplicate" style="padding-bottom: 50px">
        <h4>{{ja.duplicate.word}}</h4>
        <h5 v-if="ja.duplicate.kana" class="kana" v-html="rubyKanaHtml(ja.duplicate.kana, ja.duplicate.accent)"></h5>
        <h5 v-if="ja.duplicate.gogen">{{ja.duplicate.gogen}}</h5>
        <div v-if="ja.duplicate.meaning" v-html="ja.duplicate.meaning"></div>
        <div v-if="ja.duplicate.chinese" v-html="ja.duplicate.chinese"></div>
      </div>
      <q-fixed-position corner="top-right" :offset="[260, 20]">
        <q-btn color="primary" round @click="closeDuplicate">
          <q-icon name="close" />
        </q-btn>
      </q-fixed-position>
      <q-fixed-position corner="top-right" :offset="[190, 20]">
        <q-btn color="primary" round @click="addAlternativeWord">
          <q-icon name="add" />
        </q-btn>
      </q-fixed-position>
      <q-fixed-position corner="top-right" :offset="[120, 20]">
        <q-btn color="primary" round @click="editDuplicate(false)" v-shortkey="['meta', 'e']" @shortkey.native="editDuplicate(false)">
          <q-icon name="mode edit" />
        </q-btn>
      </q-fixed-position>
      <q-fixed-position corner="top-right" :offset="[50, 20]">
        <q-btn color="primary" round @click="editDuplicate(true)">
          <q-icon name="list" />
        </q-btn>
      </q-fixed-position>
    </q-modal>
    <span v-shortkey="['meta', 'y']" @shortkey="downloadAudio"/>
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
  QModal,
  QInfiniteScroll
} from 'quasar'
import settings from '@/configs/settings'
import { mapMutations, mapGetters } from 'vuex'
import axios from 'axios'
import DictionaryPart from './DictionaryPart'
import AudioPart from './AudioPart'
import ChinesePart from './ChinesePart'
import ExamplePart from './ExamplePart'
import ImagePart from './ImagePart'
var a = document.createElement('a')
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
      'saveJa',
      'searchJaImage',
      'searchJaExample'
    ]),
    // 音声ファイルを直接ダウンロードする
    // このサイトと関係のないおまけ機能
    downloadAudio () {
      var audioUrl = this.ja.audioList[this.ja.audioSelected[0]].url
      a.href = this.apiUrl + 'proxy?url=' + audioUrl + '&filename=' + this.word + '.mp3'
      console.log(a.href)
      a.download = this.word + '.mp3'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
    },
    // 例文のInfinite Scroll機能に使われる
    refresher: function (index, done) {
      if (this.ja.exampleList.length === 0 || this.ja.exampleEnd) {
        done()
        return
      }
      console.log('refresher')
      this.searchJaExample(done)
    },
    // 画像のモーダルを開く
    // 画像検索していなかったら検索をかける
    openImage () {
      if (!this.ja.word) {
        return
      }
      this.$refs.imageModal.open()
      if (!this.ja.image && !this.ja.imageLoading) {
        this.searchJaImage(this.$refs.image_part.update_canvas)
      }
    },
    // 単語を参照単語として保存する
    addAlternativeWord () {
      var dialog = null
      var doAdd = data => {
        console.log('wordToAdd', data.wordToAdd)
        Loading.show()
        axios.post(this.apiUrl + 'ja/save/add-alternative-word', {
          word: data.wordToAdd,
          detail_id: this.ja.duplicate.detail_id
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
    closeDuplicate (event) {
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
      this.$refs.duplicateModal.close('test')
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
      document.getElementsByClassName('q-input-target')[0].focus()
    },
    save: function () {
      this.saveJa(this.reset)
    },
    search: function (word, skipQuery) {
      if (!word) {
        console.log('search no word')
        return
      }
      /* eslint-disable */
      word = word.replace(/[ 　]/g, '')
      /* eslint-enable */
      console.log('search[' + word + ']')
      document.activeElement.blur()
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
    }
  },
  mounted: function () {
    if (this.$route.query.word) {
      var skipQuery = false
      if (this.$route.query.skipQuery) {
        skipQuery = true
      }
      var onlyAudio = false
      if (this.$route.query.onlyAudio) {
        onlyAudio = true
      }
      this.word = this.$route.query.word
      this.searchJa({word: this.word, noExample: false, noAudio: false, cb: this.showDuplicate, skipQuery: skipQuery, onlyAudio: onlyAudio})
    }
    console.log(document.getElementsByClassName('q-input-target'))
    document.getElementsByClassName('q-input-target')[0].focus()
    // Google Chrome拡張機能の場合
    var self = this
    if (window.chrome && window.chrome.tabs) {
      window.chrome.tabs.executeScript({ code: 'window.getSelection().toString();' }, function (selection) {
        console.log('word:', selection[0])
        self.word = selection[0]
        self.search(self.word)
      })
    }
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
    QModal,
    DictionaryPart,
    AudioPart,
    ChinesePart,
    ExamplePart,
    ImagePart,
    QInfiniteScroll
  }
}
</script>

<style>
  .part {
    min-height: 300px
  }
  .menu {
    padding: 20px;
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
  .part {
    overflow-y: scroll;
    max-height: calc(100vh - 64px);
    /*overflow: hidden;*/
    /*box-sizing:border-box;*/
    /*display:inline-block;*/
    /*padding: 5px 10px;*/
  }
  body{
    min-width: 800px;
    min-height: 600px;
  }
</style>
