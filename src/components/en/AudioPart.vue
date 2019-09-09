<!-- 音声コンポーネント -->
<template>
  <div>
    <q-card v-for="(a, index) in en.audioList" :key="index" @click="select(index)" :color="en.audioSelected.includes(index)?'dark':null">
      <q-card-title>
        <q-btn round small color="primary" icon="play arrow" @click="playAudio($event, index)" />
        {{a.word}}
        <span slot="subtitle">
          <div v-if="a.user">{{a.user}}</div>{{a.type}}
          <q-btn v-if="a.word_id" small outline @click="requestForvo($event, a.word_id)">Request<q-inner-loading :visible="forvoRequsting" /></q-btn>
        </span>
        <q-icon v-if="en.multiple&&en.audioSelected.includes(index)" slot="right">{{en.audioSelected.indexOf(index)+1}}</q-icon>
      </q-card-title>
    </q-card>
    <div v-if="!en.init&&!en.audioLoading" id="no_forvo"><q-btn outline @click="addForvo">Forvo Add<q-inner-loading :visible="forvoAdding" /></q-btn></div>
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
import { mapMutations, mapGetters } from 'vuex'
export default {
  name: 'audio-part',
  mounted () {
    if (this.$route.path.includes('mobile') && this.en.audioList.length === 0) {
      this.searchEnAudio(this.en.word)
    }
  },
  computed: {
    ...mapGetters(['en'])
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
    ...mapMutations(['searchEnAudio']),
    // Fサイトに新しい発音を依頼する
    addForvo () {
      var addForvoReq = (data) => {
        console.log(data.word)
        this.forvoAdding = true
        axios.get(this.apiUrl + 'en/search/audio/forvo/add', {
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
            model: this.en.word
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
    // Fサイトに既存単語の新しい発音を依頼する
    requestForvo (event, wordId) {
      console.log(wordId)
      event.stopPropagation()
      this.forvoRequsting = true
      axios.get(this.apiUrl + 'en/search/audio/forvo/request', {
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
      if (!(index + '' in this.audioCache) || this.audioCache[index + ''].src !== this.en.audioList[index].url) {
        var audio = new Audio(this.en.audioList[index].url)
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
        if (this.en.audioSelected.includes(index)) {
          var i = this.en.audioSelected.indexOf(index)
          if (i > -1) {
            this.en.audioSelected.splice(i, 1)
          }
        }
        else {
          this.en.audioSelected.push(index)
        }
      }
      else {
        if (this.en.audioSelected.includes(index)) {
          this.en.audioSelected = []
        }
        else {
          this.en.audioSelected = [index]
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
