<!-- 画像コンポーネント -->
<!-- 検索した結果を表示するや画像のアップロードもできる -->
<template>
  <div>
      <q-card>
        <img v-if="ja.image" :src="'data:image/png;base64,'+ja.image">
        <q-inner-loading :visible="ja.imageLoading" />
      </q-card>
      <div v-if="ja.image" class="row justify-center">
        <q-toggle v-model="ja.useImage" label="使用" />
      </div>
      <div class="row justify-center">
        <label for="file_photo">
          <div id="add_photo_btn">アップロード</div>
          <input type="file" 
                 id="file_photo"
                 accept="image/*" 
                 style="display: none" 
                 @change="upload">
        </label>
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
const MAX_WIDTH = 350
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
    ...mapMutations(['searchImage']),
    // 画像をアップロードしてbase64に変換
    upload (event) {
      const file = event.target.files[0]
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const reader = new FileReader()
      reader.onload = event => {
        const img = new Image()
        img.onload = () => {
          if (img.width > MAX_WIDTH) {
            canvas.width = MAX_WIDTH
            canvas.height = (MAX_WIDTH * img.height) / img.width
          }
          else {
            canvas.width = img.width
            canvas.height = img.height
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          this.ja.image = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '')
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
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
    QInnerLoading,
    QToggle,
    QFixedPosition
  }
}
</script>

<style>

</style>
