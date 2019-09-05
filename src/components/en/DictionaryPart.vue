<!-- 日本語辞書コンポーネント -->
<template>
  <div>
    <q-card v-for="(d, index) in en.dictionaryList" :key="index" @click="select(index)" :color="en.dictionarySelected.includes(index)?'dark':null">
      <q-card-title>
        <span v-if="d.kanji">{{d.kanji}}</span><span v-else>{{d.word}}</span>
        <div class="sub">
          <q-btn v-if="d.sound" round small color="primary" icon="play arrow" @click="playAudio($event, index)" />
          <span class="pron" v-if="d.pron">{{d.pron}}</span>
        </div>
        <q-icon v-if="en.multiple&&en.dictionarySelected.includes(index)" slot="right">{{en.dictionarySelected.indexOf(index)+1}}</q-icon>
        <!-- <span slot="subtitle">Subtitle</span> -->
      </q-card-title>
      <q-card-main v-html="d.meaning">
        <!-- {{d.meaning}} -->
      </q-card-main>
      <q-card-actions align="around" v-if="en.dictionarySelected.includes(index)">
        <q-btn :flat="d.kana?true:false" :color="d.kana?'warning':'negative'" @click="editCard($event, d, index)"><q-icon name="mode edit" />Modify</q-btn>
      </q-card-actions>
    </q-card>
    <div v-if="!en.init&&!en.dictionaryLoading&&en.dictionaryList.length==0" id="no_dict"><q-btn outline @click="addCard">Add</q-btn></div>
    <q-modal ref="editorModal" :content-css="{padding: '15px'}">
      <div v-if="editing">
        <h5>{{editing.word}}</h5>
        <q-btn color="primary" @click="saveCard">Save</q-btn>
        <q-btn outline color="primary" @click="$refs.editorModal.close()">Cancel</q-btn>
        <q-input v-model="editing.pron" stack-label="pron" />
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
    ...mapGetters(['en'])
  },
  data () {
    return {
      audioCache: {},
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
    playAudio: function (event, index) {
      event.stopPropagation()
      if (!(index + '' in this.audioCache) || this.audioCache[index + ''].src !== this.en.dictionaryList[index].sound) {
        var audio = new Audio(this.en.dictionaryList[index].sound)
        this.audioCache[index + ''] = audio
        audio.play()
      }
      else {
        this.audioCache[index + ''].pause()
        this.audioCache[index + ''].currentTime = 0
        this.audioCache[index + ''].play()
      }
    },
    select: function (index) {
      if (this.en.multiple) {
        if (this.en.dictionarySelected.includes(index)) {
          var i = this.en.dictionarySelected.indexOf(index)
          if (i > -1) {
            this.en.dictionarySelected.splice(i, 1)
          }
        }
        else {
          this.en.dictionarySelected.push(index)
        }
      }
      else {
        if (this.en.dictionarySelected.includes(index)) {
          this.en.dictionarySelected = []
        }
        else {
          this.en.dictionarySelected = [index]
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
      Vue.set(this.en.dictionaryList, this.editingIndex, this.editing)
      this.$refs.editorModal.close()
    },
    addCard () {
      this.en.dictionaryList.push({
        word: null,
        pron: null,
        meaning: null
      })
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
  #no_dict {
    width: 100%;
    text-align: center;
    margin-top: 10px;
  }
  .meaning .definition {
    margin-bottom: 1em;
  }
  .meaning .word_type {
    font-weight: bold;
  }
  .meaning .meaning_list {
    display:list-item;
    margin-left: 1.3em;
  }
  .meaning .example {
    color: grey;
  }
</style>
