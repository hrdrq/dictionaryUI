<!-- パソコンとGoogle Chrome拡張機能用 -->
<!-- mobile.vueにも同じコードが多いので、統合したい -->
<template>
  <q-layout ref="layout" view="lHh Lpr FFF">
    <div class="row">
      <div class="col"><q-input v-model="word" placeholder="Word" @keydown.enter="word=word.replace(/^\s+|\s+$/g, '');search(word)" autofocus /></div>
      <div class="col">
        <q-toggle class="menu" v-model="en.multiple" label="Multiple" />
        <q-btn color="white" class="text-black" @click="search(word,true)">SQ</q-btn>
        <q-btn color="white" class="text-black" @click="searchEnAudio(word)">Audio</q-btn>
        <span v-shortkey="['meta', 'd']" @shortkey="openImage"/>
        <span v-shortkey="['meta', 's']" @shortkey="save"/>
      </div>
    </div>
    <div class="row">
      <div class="col part"><dictionary-part></dictionary-part><div class="relative-position part"><q-inner-loading :visible="en.dictionaryLoading" /></div></div>
      <div class="col part"><example-part></example-part></div>
      <div class="col part"><audio-part></audio-part><div class="relative-position part"><q-inner-loading :visible="en.forvoLoading" /></div></div>
    </div>
    <q-modal ref="imageModal" :content-css="{padding: '15px'}">
      <image-part></image-part>
    </q-modal>
    <q-modal maximized ref="duplicateModal" @escape-key="closeDuplicate" :content-css="{padding: '15px'}">
      <div v-if="en.duplicate" style="padding-bottom: 50px">
        <h4>{{en.duplicate.word}}</h4>
        <h5 v-if="en.duplicate.pron">{{en.duplicate.pron}}</h5>
        <div v-if="en.duplicate.meaning" v-html="en.duplicate.meaning"></div>
      </div>
      <q-fixed-position corner="top-right" :offset="[190, 20]">
        <q-btn color="primary" round @click="closeDuplicate">
          <q-icon name="close" />
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
import DictionaryPart from './DictionaryPart'
import AudioPart from './AudioPart'
import ExamplePart from './ExamplePart'
import ImagePart from './ImagePart'
var a = document.createElement('a')
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
      'searchEnAudio',
      'resetEn',
      'saveEn',
      'searchEnImage',
      'searchEnExample'
    ]),
    // 音声ファイルを直接ダウンロードする
    // このサイトと関係のないおまけ機能
    downloadAudio () {
      var audioUrl = this.en.audioList[this.en.audioSelected[0]].url
      a.href = this.apiUrl + 'proxy?url=' + audioUrl
      console.log(a.href)
      a.download = this.word + '.mp3'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
    },
    // 画像のモーダルを開く
    // 画像検索していなかったら検索をかける
    openImage () {
      if (!this.en.word) {
        return
      }
      this.$refs.imageModal.open()
      if (!this.en.image && !this.en.imageLoading) {
        this.searchEnImage()
      }
    },
    // 既存単語モーダルを閉じる
    closeDuplicate (event) {
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
      this.$refs.duplicateModal.close('test')
      this.searchEn({word: this.word, noExample: !searchExample, noAudio: true, cb: null})
    },
    // 既存単語モーダルを開く
    showDuplicate () {
      this.$refs.duplicateModal.open()
    },
    reset () {
      this.word = ''
      this.searchedWord = []
      document.getElementsByClassName('q-input-target')[0].focus()
    },
    save: function () {
      this.saveEn({word: this.word, cb: this.reset})
    },
    search: function (word, skipQuery) {
      if (!word) {
        console.log('search no word')
        return
      }
      /* eslint-disable */
      // word = word.replace(/^\s+|\s+$/g, '')
      /* eslint-enable */
      console.log('search[' + word + ']')
      document.activeElement.blur()
      this.resetEn()
      this.searchEn({word: word, noExample: false, noAudio: true, cb: this.showDuplicate, skipQuery: skipQuery})
      this.searchedWord.push(word)
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
      this.searchEn({word: this.word, noExample: false, noAudio: false, cb: this.showDuplicate, skipQuery: skipQuery, onlyAudio: onlyAudio})
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
  .pron {
    margin-right: 10px;
    /*color: #1c305c;*/
  }
  .pron div {
    margin-top: 5px;
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
