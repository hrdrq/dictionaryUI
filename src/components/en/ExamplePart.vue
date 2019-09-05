<!-- 例文コンポーネント -->
<!-- Infinite Scroll対応 -->
<template>
  <div>
    <q-card v-for="(e, index) in en.exampleList" :key="index" @click="select(index)" :color="en.exampleSelected.includes(index)?'dark':null">
      <q-card-title>
        <div class="example" v-html="highlight(e.sentence)"></div>
        <q-icon v-if="en.multiple&&en.exampleSelected.includes(index)" slot="right">{{en.exampleSelected.indexOf(index)+1}}</q-icon>
      </q-card-title>
    </q-card>
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
    ...mapGetters(['en'])
  },
  methods: {
    ...mapMutations(['searchEnExample']),
    select: function (index) {
      if (this.en.multiple) {
        if (this.en.exampleSelected.includes(index)) {
          var i = this.en.exampleSelected.indexOf(index)
          if (i > -1) {
            this.en.exampleSelected.splice(i, 1)
          }
        }
        else {
          this.en.exampleSelected.push(index)
        }
      }
      else {
        if (this.en.exampleSelected.includes(index)) {
          this.en.exampleSelected = []
        }
        else {
          this.en.exampleSelected = [index]
        }
      }
    },
    highlight: function (senetnce) {
      return senetnce.replace(new RegExp(this.en.word, 'ig'), '<b>' + this.en.word + '</b>')
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
