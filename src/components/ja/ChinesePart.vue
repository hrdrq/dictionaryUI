<!-- 中国語辞書コンポーネント -->
<template>
  <div>
    <q-card v-for="(c, index) in ja.chineseList" :key="index" @click="select(index)" :color="ja.chineseSelected.includes(index)?'dark':null">
      <q-card-title>
        <span v-if="c.kanji">{{c.kanji}}　</span><span v-if="c.kana">{{c.kana}}</span>
        <q-icon v-if="ja.multiple&&ja.chineseSelected.includes(index)" slot="right">{{ja.chineseSelected.indexOf(index)+1}}</q-icon>
        <!-- <span slot="subtitle">Subtitle</span> -->
      </q-card-title>
      <q-card-main v-html="c.meaning">
        <!-- {{c.meaning}} -->
      </q-card-main>
      <q-card-actions align="around" v-if="ja.chineseSelected.includes(index)">
        <q-btn flat color="warning" @click="editCard($event, c, index)"><q-icon name="mode edit" />修正</q-btn>
      </q-card-actions>
    </q-card>
    <q-modal ref="editorModal" :content-css="{padding: '15px'}">
      <div v-if="editing">
        <h5>{{editing.word}}</h5>
        <q-btn color="primary" @click="saveCard">保存</q-btn>
        <q-btn outline color="primary" @click="$refs.editorModal.close()">キャンセル</q-btn>
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
  name: 'chinese-part',
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
        if (this.ja.chineseSelected.includes(index)) {
          var i = this.ja.chineseSelected.indexOf(index)
          if (i > -1) {
            this.ja.chineseSelected.splice(i, 1)
          }
        }
        else {
          this.ja.chineseSelected.push(index)
        }
      }
      else {
        if (this.ja.chineseSelected.includes(index)) {
          this.ja.chineseSelected = []
        }
        else {
          this.ja.chineseSelected = [index]
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
      Vue.set(this.ja.chineseList, this.editingIndex, this.editing)
      // this.updateJa(this.ja)
      this.$refs.editorModal.close()
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
  .star_img {
    /*display: block;
    float: left;
    width: 16px;
    height: 16px;

    background: url('/#/static/_star.gif');*/
  }
</style>
