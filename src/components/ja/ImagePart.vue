<template>
  <div>
      <q-card>
        <img v-if="ja.image" :src="'data:image/png;base64,'+ja.image">
        <q-inner-loading :visible="ja.imageLoading" />
      </q-card>
      <div v-if="ja.image" class="row justify-center">
        <q-toggle v-model="ja.useImage" label="使用" />
      </div>
      
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
  QInnerLoading,
  QToggle,
  QFixedPosition
} from 'quasar'
import { mapMutations, mapGetters } from 'vuex'
export default {
  name: 'image-part',
  mounted () {
    if (!this.ja.image) {
      this.searchImage()
    }
  },
  computed: {
    ...mapGetters(['ja'])
  },
  methods: {
    ...mapMutations(['searchImage'])
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
    QInnerLoading,
    QToggle,
    QFixedPosition
  }
}
</script>

<style>

</style>
