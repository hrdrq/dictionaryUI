<!-- 例文コンポーネント -->
<!-- Infinite Scroll対応 -->
<template>
  <div>
    <q-infinite-scroll v-if="ja.word" :handler="refresher">
      <q-card v-for="(e, index) in ja.exampleList" :key="index" @click="select(index)" :color="ja.exampleSelected.includes(index)?'dark':null">
        <q-card-title>
          <div class="example" v-html="toRuby(e.sentence)"></div>
          <q-icon v-if="ja.multiple&&ja.exampleSelected.includes(index)" slot="right">{{ja.exampleSelected.indexOf(index)+1}}</q-icon>
        </q-card-title>
      </q-card>
      <div v-if="ja.exampleList.length>0" class="row justify-center" style="margin-bottom: 50px;">
        <q-spinner-dots slot="message" :size="40" />
      </div>
    </q-infinite-scroll>
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
  QInfiniteScroll,
  QSpinnerDots
} from 'quasar'
import { mapMutations, mapGetters } from 'vuex'
export default {
  name: 'example-part',
  computed: {
    ...mapGetters(['ja'])
  },
  methods: {
    ...mapMutations(['searchJaExample']),
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
    toRuby: function (senetnce) {
      return senetnce.replace(/ ?([^ >]+?)\[(.+?)\]/g, '<ruby><rb>$1</rb><rt>$2</rt></ruby>')
    },
    select: function (index) {
      if (this.ja.multiple) {
        if (this.ja.exampleSelected.includes(index)) {
          var i = this.ja.exampleSelected.indexOf(index)
          if (i > -1) {
            this.ja.exampleSelected.splice(i, 1)
          }
        }
        else {
          this.ja.exampleSelected.push(index)
        }
      }
      else {
        if (this.ja.exampleSelected.includes(index)) {
          this.ja.exampleSelected = []
        }
        else {
          this.ja.exampleSelected = [index]
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
    QInfiniteScroll,
    QSpinnerDots
  }
}
</script>

<style>
 .example b {
  color: black;
  background-color: yellow
 }
 .bg-dark b rt{
  color: white;
 }
</style>
