<template>
  <div>
    <q-card v-for="(a, index) in ja.audioList" :key="index" @click="select(index)" :color="ja.audioSelected.includes(index)?'dark':null">
      <q-card-title>
        <q-btn round small color="primary" icon="play arrow" @click="playAudio($event, index)" />
        {{a.word}}
        <span slot="subtitle">
          {{a.type}}
          <q-btn v-if="a.word_id" small outline @click="requestForvo($event, a.word_id)">依頼<q-inner-loading :visible="forvoRequsting" /></q-btn>
        </span>
        <q-icon v-if="ja.multiple&&ja.audioSelected.includes(index)" slot="right">{{ja.audioSelected.indexOf(index)+1}}</q-icon>
      </q-card-title>
    </q-card>
    <div v-if="!ja.init&&!ja.audioLoading" id="no_forvo"><q-btn outline @click="addForvo">Forvo追加<q-inner-loading :visible="forvoAdding" /></q-btn></div>
  </div>
</template>

<script>
import {
  Dialog,
  Alert,
  QCard,
  QCardTitle,
  QCardMain,
  QCardActions,
  QBtn,
  QIcon,
  QModal,
  QInput,
  QChipsInput,
  QInnerLoading
} from 'quasar'
import settings from '@/configs/settings'
import axios from 'axios'
import { mapGetters } from 'vuex'
export default {
  name: 'audio-part',
  computed: {
    ...mapGetters(['ja'])
  },
  data () {
    return {
      audioCache: {},
      forvoAdding: false,
      forvoAdded: false,
      forvoRequsting: false,
      apiUrl: settings.apiUrl
    }
  },
  methods: {
    addForvo () {
      var addForvoReq = (data) => {
        console.log(data.word)
        this.forvoAdding = true
        axios.get(this.apiUrl + 'ja/search/audio/forvo/add', {
          params: {
            word: data.word
          }
        }).then(response => {
          this.forvoAdding = false
          if (response.data.status === 'success') {
            this.forvoAdded = true
          }
          else {
            Alert.create({
              enter: 'bounceInRight',
              leave: 'bounceOutRight',
              color: 'positive',
              icon: 'wifi',
              html: `Forvo追加失敗しました`,
              position: 'top-right',
              actions: [
                {
                  label: 'Snooze',
                  handler () {
                    console.log('acting')
                  }
                },
                {
                  label: 'Abort',
                  handler () {
                    console.log('aborting')
                  }
                }
              ]
            })
          }
        })
      }
      Dialog.create({
        title: 'Forvo追加',
        form: {
          word: {
            type: 'text',
            model: this.ja.word
          }
        },
        buttons: [
          'Cancel',
          {
            label: 'Ok',
            handler: addForvoReq
          }
        ]
      })
    },
    requestForvo (event, wordId) {
      console.log(wordId)
      event.stopPropagation()
      this.forvoRequsting = true
      axios.get(this.apiUrl + 'ja/search/audio/forvo/request', {
        params: {
          word_id: wordId
        }
      }).then(response => {
        this.forvoRequsting = false
        if (response.data.status === 'success') {
          console.log('Forvo依頼しました')
        }
        else {
          Alert.create({
            enter: 'bounceInRight',
            leave: 'bounceOutRight',
            color: 'positive',
            icon: 'wifi',
            html: `Forvo依頼失敗しました`,
            position: 'top-right',
            actions: [
              {
                label: 'Snooze',
                handler () {
                  console.log('acting')
                }
              },
              {
                label: 'Abort',
                handler () {
                  console.log('aborting')
                }
              }
            ]
          })
        }
      })
    },
    playAudio: function (event, index) {
      event.stopPropagation()
      if (!(index + '' in this.audioCache) || this.audioCache[index + ''].src !== this.ja.audioList[index].url) {
        var audio = new Audio(this.ja.audioList[index].url)
        this.audioCache[index + ''] = audio
        audio.play()
      }
      else {
        this.audioCache[index + ''].pause()
        this.audioCache[index + ''].currentTime = 0
        this.audioCache[index + ''].play()
      }
      // var audio = new Audio(url)
      // audio.play()
    },
    select: function (index) {
      if (this.ja.multiple) {
        if (this.ja.audioSelected.includes(index)) {
          var i = this.ja.audioSelected.indexOf(index)
          if (i > -1) {
            this.ja.audioSelected.splice(i, 1)
          }
        }
        else {
          this.ja.audioSelected.push(index)
        }
      }
      else {
        if (this.ja.audioSelected.includes(index)) {
          this.ja.audioSelected = []
        }
        else {
          this.ja.audioSelected = [index]
        }
      }
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
    QChipsInput,
    QInnerLoading
  }
}
</script>

<style>
  #no_forvo {
    width: 100%;
    text-align: center;
    margin-top: 10px;
  }
</style>
