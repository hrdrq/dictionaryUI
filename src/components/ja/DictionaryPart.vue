<!-- 日本語辞書コンポーネント -->
<template>
  <div>
    <q-card v-for="(d, index) in ja.dictionaryList" :key="index" @click="select(index)" :color="ja.dictionarySelected.includes(index)?'dark':null">
      <q-card-title>
        <span v-if="d.kanji">{{d.kanji}}</span><span v-else>{{d.word}}</span>
        <div class="sub" v-if="d.kana||d.gogen">
          <span class="kana" v-html="rubyKanaHtml(d.kana, d.accent)"></span>
          <span class="gogen" v-if="d.gogen">{{d.gogen}}</span>
        </div>
        <q-icon v-if="ja.multiple&&ja.dictionarySelected.includes(index)" slot="right">{{ja.dictionarySelected.indexOf(index)+1}}</q-icon>
        <!-- <span slot="subtitle">Subtitle</span> -->
      </q-card-title>
      <q-card-main v-html="d.meaning">
        <!-- {{d.meaning}} -->
      </q-card-main>
      <q-card-actions align="around" v-if="ja.dictionarySelected.includes(index)">
        <q-btn :flat="d.kana?true:false" :color="d.kana?'warning':'negative'" @click="editCard($event, d, index)"><q-icon name="mode edit" />修正</q-btn>
      </q-card-actions>
    </q-card>
    <div v-if="!ja.init&&!ja.dictionaryLoading&&ja.dictionaryList.length==0" id="no_dict"><q-btn outline @click="addCard">追加</q-btn></div>
    <q-modal ref="editorModal" :content-css="{padding: '15px'}">
      <div v-if="editing">
        <h5>{{editing.word}}</h5>
        <q-btn color="primary" @click="saveCard">保存</q-btn>
        <q-btn outline color="primary" @click="$refs.editorModal.close()">キャンセル</q-btn>
        <q-input v-model="editing.kana" stack-label="カナ" />
        <q-chips-input v-model="editing.accent" stack-label="アクセント" />
        <q-input v-model="editing.gogen" stack-label="語源" />
        <froala :tag="'textarea'" :config="froalaConfig" v-model="editing.meaning"></froala>
      </div>
    </q-modal>
  </div>
</template>

<script>
import {
  QCard,
  QCardTitle,
  QCardMain,
  QCardActions,
  QBtn,
  QIcon,
  QModal,
  QInput,
  QChipsInput
} from 'quasar'
import Vue from 'vue'
import { mapMutations, mapGetters } from 'vuex'
export default {
  name: 'dictionary-part',
  computed: {
    ...mapGetters(['ja'])
  },
  data () {
    return {
      editing: null,
      editingIndex: null,
      froalaConfig: {
        toolbarButtonsXS: ['bold', 'fontSize', 'color', 'outdent', 'indent', 'clearFormatting', 'undo', 'redo'],
        events: {
          'froalaEditor.initialized': function () {
            var el = document.querySelectorAll('[href="https://www.froala.com/wysiwyg-editor?k=u"]')
            if (el.length) {
              el = el[0].parentNode
              el.parentNode.removeChild(el)
            }
          }
        }
      }
    }
  },
  methods: {
    ...mapMutations(['updateJa']),
    select: function (index) {
      if (this.ja.multiple) {
        if (this.ja.dictionarySelected.includes(index)) {
          var i = this.ja.dictionarySelected.indexOf(index)
          if (i > -1) {
            this.ja.dictionarySelected.splice(i, 1)
          }
        }
        else {
          this.ja.dictionarySelected.push(index)
        }
      }
      else {
        if (this.ja.dictionarySelected.includes(index)) {
          this.ja.dictionarySelected = []
        }
        else {
          this.ja.dictionarySelected = [index]
        }
      }
    },
    editCard: function (event, card, index) {
      event.stopPropagation()
      this.editing = JSON.parse(JSON.stringify(card))
      this.editingIndex = index
      this.$refs.editorModal.open()
    },
    saveCard: function () {
      // this.ja.dictionaryList[this.editingIndex] = this.editing
      Vue.set(this.ja.dictionaryList, this.editingIndex, this.editing)
      // this.updateJa(this.ja)
      this.$refs.editorModal.close()
    },
    addCard () {
      this.ja.dictionaryList.push({
        word: null,
        kana: null,
        accent: [],
        gogen: null,
        meaning: null
      })
    },
    rubyKanaHtml: function (kana, accent) {
      // console.log(kana, accentString)
      if (!accent || accent.length === 0) {
        return kana
      }
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
    }
  },
  components: {
    QCard,
    QCardTitle,
    QCardMain,
    QCardActions,
    QBtn,
    QIcon,
    QModal,
    QInput,
    QChipsInput
  }
}
</script>

<style>
  .sub {
    font-size: 80%;
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
  #no_dict {
    width: 100%;
    text-align: center;
    margin-top: 10px;
  }
</style>
