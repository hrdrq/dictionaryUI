<template>
  <q-layout ref="layout" view="lHh Lpr FFF">
    <div class="row">
      <div class="col"><q-input v-model="word" placeholder="単語" @keydown.enter="search(word)" autofocus /></div>
      <div class="col"><q-input v-model="alternativeWord" placeholder="代替検索" @keydown.enter="alternativeSearch(alternativeWord)" /></div>
      <div class="col">
        <q-toggle class="menu" v-model="ja.multiple" label="複数" />
        <q-btn color="white" class="text-black" @click="openImage" v-shortkey="['meta', 'g']" @shortkey.native="openImage">画像</q-btn>
        <q-btn color="white" class="text-black" @click="save" v-shortkey="['meta', 's']" @shortkey.native="save">保存</q-btn>
      </div>
      <div class="col" style="padding-top: 20px">
        <q-btn color="white" class="text-black" @click="$refs.listModal.open()">リスト</q-btn>
        <span>{{wordNum}}</span>
      </div>
    </div>
    <div class="row">
      <div class="col part" v-if="ja.duplicate">
        <q-card color="dark">
          <h5 v-if="ja.duplicate.example" class="d_example" v-html="toRuby(ja.duplicate.example)"></h5>
        </q-card>
        <q-card>
          <span v-if="ja.duplicate.kana" class="kana" v-html="rubyKanaHtml(ja.duplicate.kana, ja.duplicate.accent)"></span>
          <span v-if="ja.duplicate.gogen">{{ja.duplicate.gogen}}</span>
        </q-card>
        <q-card color="dark">
          <div v-if="ja.duplicate.meaning" v-html="ja.duplicate.meaning"></div>
        </q-card>
        <q-card>
          <div v-if="ja.duplicate.chinese" v-html="ja.duplicate.chinese"></div>
        </q-card>
      </div>
      <div class="col part">
        <q-infinite-scroll :handler="refresher" inline style="height: 100vh; overflow: auto">
          <example-part></example-part>
        </q-infinite-scroll>
        <div class="relative-position part"><q-inner-loading :visible="ja.exampleLoading" /></div>
      </div>
      <div class="col part"><dictionary-part></dictionary-part><div class="relative-position part"><q-inner-loading :visible="ja.dictionaryLoading" /></div></div>
      <div class="col part"><chinese-part></chinese-part><div class="relative-position part"><q-inner-loading :visible="ja.chineseLoading" /></div></div>
    </div>
    <q-modal ref="imageModal" :content-css="{padding: '15px'}">
      <image-part></image-part>
    </q-modal>
    <q-modal maximized ref="duplicateModal" @escape-key="closeDuplicate" :content-css="{padding: '15px'}">
      <div v-if="ja.duplicate" style="padding-bottom: 50px">
        <h4>{{ja.duplicate.word}}</h4>
        <h5 v-if="ja.duplicate.kana" class="kana" v-html="rubyKanaHtml(ja.duplicate.kana, ja.duplicate.accent)"></h5>
        <h5 v-if="ja.duplicate.gogen">{{ja.duplicate.gogen}}</h5>
        <div v-if="ja.duplicate.meaning" v-html="ja.duplicate.meaning"></div>
        <div v-if="ja.duplicate.chinese" v-html="ja.duplicate.chinese"></div>
      </div>
      <q-fixed-position v-if="" corner="top-right" :offset="[260, 20]">
        <q-btn color="primary" round @click="closeDuplicate">
          <q-icon name="close" />
        </q-btn>
      </q-fixed-position>
      <q-fixed-position v-if="" corner="top-right" :offset="[190, 20]">
        <q-btn color="primary" round @click="addAlternativeWord">
          <q-icon name="add" />
        </q-btn>
      </q-fixed-position>
      <q-fixed-position v-if="" corner="top-right" :offset="[120, 20]">
        <q-btn color="primary" round @click="editDuplicate(false)">
          <q-icon name="mode edit" />
        </q-btn>
      </q-fixed-position>
      <q-fixed-position v-if="" corner="top-right" :offset="[50, 20]">
        <q-btn color="primary" round @click="editDuplicate(true)">
          <q-icon name="list" />
        </q-btn>
      </q-fixed-position>
    </q-modal>
    <q-modal ref="listModal" :content-css="{padding: '15px'}">
      <q-input type="textarea" :max-height="400" v-model="wordListStr"/>
      <q-btn @click="loadList">読み込む</q-btn>
    </q-modal>
    <span v-shortkey="['meta', 'd']" @shortkey="editDuplicate(true)" />
    <span v-shortkey="['meta', 'e']" @shortkey="skip" />
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
  QCard,
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
const compareDt = new Date('2017-08-25 00:00:00').getTime()
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
      apiUrl: settings.apiUrl,
      wordListStr: '',
      wordList: null,
      wordNum: null
    }
  },
  methods: {
    ...mapMutations([
      'searchJa',
      'resetJa',
      'saveJa',
      'searchImage',
      'searchJaExample'
    ]),
    skip () {
      this.resetJa()
      this.processList()
    },
    loadList () {
      // console.log(this.wordList)
      this.$refs.listModal.close()
      this.alternativeWord = ''
      this.searchedWord = []
      this.wordList = this.wordListStr.split('\n')
      this.word = this.wordList[0]
      this.wordNum = this.wordList.length
      this.search(this.word)
    },
    processList () {
      this.alternativeWord = ''
      this.searchedWord = []
      if (this.word === this.wordList[0]) {
        this.wordList.splice(0, 1)
        this.word = this.wordList[0]
        this.wordListStr = this.wordList.join('\n')
        this.wordNum = this.wordList.length
      }
      else {
        this.word = this.wordList[0]
      }
      this.search(this.word)
    },
    checkUpdate () {
      if (new Date(this.ja.duplicate.updated).getTime() > compareDt) {
        console.log(new Date(this.ja.duplicate.updated).getTime(), compareDt)
        this.skip()
      }
    },
    refresher: function (index, done) {
      // console.log(this.ja.exampleList.length, this.ja.exampleEnd)
      if (this.ja.exampleList.length === 0 || this.ja.exampleEnd) {
        done()
        // console.log('refresher do nothing')
        return
      }
      console.log('refresher')
      this.searchJaExample(done)
    },
    openImage () {
      if (!this.ja.word) {
        return
      }
      this.$refs.imageModal.open()
      if (!this.ja.image && !this.ja.imageLoading) {
        this.searchImage()
      }
    },
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
            type: 'text',
            model: 'クマ'
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
    closeDuplicate (event) {
      // console.log('event', event)
      // console.log('close', this.$refs.duplicateModal)
      this.$refs.duplicateModal.close()
      this.resetJa()
      this.reset()
    },
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
      // this.word = ''
      // this.alternativeWord = ''
      // this.searchedWord = []
      this.saveJa(this.processList)
    },
    search: function (word) {
      if (!word) {
        console.log('search no word')
        return
      }
      console.log('search', word)
      document.activeElement.blur()
      this.resetJa()
      this.searchJa({word: word, noExample: false, noAudio: false, cb: this.checkUpdate})
      this.searchedWord.push(word)
    },
    alternativeSearch (word) {
      if (this.searchedWord.includes[word]) {
        return
      }
      this.searchJa(word)
      this.searchedWord.push(word)
    },
    rubyKanaHtml: function (kana, accent) {
      // console.log(kana, accentString)
      if (!accent || accent === '') {
        return kana
      }
      accent = accent.split(',')
      // var el = document.getElementById('pitch');
      var result = ''
      accent.forEach(function (a) {
        var moras = kana.split(/(?![ゃゅょぁぃぅぇぉャュョァィゥェォ])/)
        if (a > 0) {
          moras[a - 1] = '<b>' + moras[a - 1] + '</b>'
        }
        var l = a > 0 ? a - 2 : moras.length - 1
        if (l > 0) {
          moras[l] += '</i>'
          moras[1] = '<i>' + moras[1]
        }
        result += (result === '' ? '' : '　') + moras.join('')
      })
      return result
    },
    toRuby: function (senetnce) {
      return senetnce.replace(/ ?([^ >]+?)\[(.+?)\]/g, '<ruby><rb>$1</rb><rt>$2</rt></ruby>')
    }
  },
  mounted: function () {
    // console.log(this)
    document.title = '例文追加'
    console.log(document.getElementsByClassName('q-input-target'))
    document.getElementsByClassName('q-input-target')[0].focus()
    window.onbeforeunload = function (e) {
      e = e || window.event
      console.log('closing')
      // For IE and Firefox prior to version 4
      if (e) {
        e.returnValue = 'Any string'
      }
      // For Safari
      return 'Any string'
    }
    // this.searchJa('テスト')
    // console.log(this.$refs.word.$refs.input.$refs.input)
    // this.$refs.word.$refs.input.$refs.input.focus()
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
    QCard,
    QModal,
    QInfiniteScroll,
    DictionaryPart,
    AudioPart,
    ChinesePart,
    ExamplePart,
    ImagePart
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
 .d_example b {
  color: black;
  font-weight: normal;
  background-color: #c1d8ac
 }
</style>
