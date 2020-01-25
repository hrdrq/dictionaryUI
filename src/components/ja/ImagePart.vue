<!-- 画像コンポーネント -->
<!-- 検索した結果を表示するや画像のアップロードもできる -->
<template>
  <div>
      <q-card>
        <img v-if="ja.image" :src="'data:image/png;base64,'+ja.image" ref="img_tag" style="display:none">
        <canvas id="sketchpad" height="360" width="360" ref="sketchpad" />
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
// Variables for referencing the canvas and 2dcanvas context
var canvas, ctx, ja;

// Variables to keep track of the mouse position and left-button status 
var mouseX,mouseY,mouseDown=0;

// Variables to keep track of the touch position
var touchX,touchY;

// Draws a dot at a specific position on the supplied canvas name
// Parameters are: A canvas context, the x position, the y position, the size of the dot
function drawDot(ctx,x,y,size) {
    // Let's use black by setting RGB values to 0, and 255 alpha (completely opaque)
    var r=0;
    var g=0;
    var b=0;
    var a=255;

    // Select a fill style
    ctx.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";

    // Draw a filled circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI*2, true); 
    ctx.closePath();
    ctx.fill();
} 

// Clear the canvas context using the canvas width and height
function clearCanvas(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Keep track of the mouse button being pressed and draw a dot at current location
function sketchpad_mouseDown() {
    mouseDown=1;
    drawDot(ctx,mouseX,mouseY,12);
}

// Keep track of the mouse button being released
function sketchpad_mouseUp() {
    mouseDown=0;
    ja.image = canvas_to_image(canvas)
}

// Keep track of the mouse position and draw a dot if mouse button is currently pressed
function sketchpad_mouseMove(e) { 
    // Update the mouse co-ordinates when moved
    getMousePos(e);

    // Draw a dot if the mouse button is currently being pressed
    if (mouseDown==1) {
        drawDot(ctx,mouseX,mouseY,12);
    }
}

// Get the current mouse position relative to the top-left of the canvas
function getMousePos(e) {
    if (!e)
        var e = event;

    if (e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if (e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }
 }

// Draw something when a touch start is detected
function sketchpad_touchStart() {
    // Update the touch co-ordinates
    getTouchPos();

    drawDot(ctx,touchX,touchY,12);

    // Prevents an additional mousedown event being triggered
    event.preventDefault();
}

// Draw something and prevent the default scrolling when touch movement is detected
function sketchpad_touchMove(e) { 
    // Update the touch co-ordinates
    getTouchPos(e);

    // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
    drawDot(ctx,touchX,touchY,12); 

    // Prevent a scrolling action as a result of this touchmove triggering.
    event.preventDefault();
}

function sketchpad_touchEnd(e) { 
    ja.image = canvas_to_image(canvas)
    event.preventDefault();
}

// Get the touch position relative to the top-left of the canvas
// When we get the raw values of pageX and pageY below, they take into account the scrolling on the page
// but not the position relative to our target div. We'll adjust them using "target.offsetLeft" and
// "target.offsetTop" to get the correct values in relation to the top left of the canvas.
function getTouchPos(e) {
    if (!e)
        var e = event;

    if(e.touches) {
        if (e.touches.length == 1) { // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            const rect = e.target.getBoundingClientRect()
            touchX=touch.clientX - window.pageXOffset - rect.left;
            touchY=touch.clientY - window.pageYOffset - rect.top;
        }
    }
}

function event_listen(canvas_, ctx_, ja_) {
  canvas = canvas_
  ctx = ctx_
  ja = ja_
  // React to mouse events on the canvas, and mouseup on the entire document
  canvas.addEventListener('mousedown', sketchpad_mouseDown, false);
  canvas.addEventListener('mousemove', sketchpad_mouseMove, false);
  window.addEventListener('mouseup', sketchpad_mouseUp, false);

  // React to touch events on the canvas
  canvas.addEventListener('touchstart', sketchpad_touchStart, false);
  canvas.addEventListener('touchmove', sketchpad_touchMove, false);
  canvas.addEventListener('touchend', sketchpad_touchEnd, false);
}

function canvas_to_image(canvas) {
  return canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '')
}

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
      this.searchJaImage(this.update_canvas)
    }
  },
  computed: {
    ...mapGetters(['ja'])
  },
  methods: {
    ...mapMutations(['searchJaImage']),
    update_canvas () {
      const canvas = this.$refs.sketchpad
      const ctx = canvas.getContext('2d')
      setTimeout(() => {
        ctx.drawImage(this.$refs.img_tag, 0,0)
        event_listen(canvas, ctx, this.ja)
      }, 100)
    },
    clear_canvas () {
      const canvas = this.$refs.sketchpad
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, 360, 360);
    },
    // 画像をアップロードしてbase64に変換
    upload (event) {
      const file = event.target.files[0]
      // const canvas = document.createElement('canvas')
      const canvas = this.$refs.sketchpad
      const ctx = canvas.getContext('2d')
      clearCanvas(canvas, ctx)
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
          this.ja.image = canvas_to_image(canvas)
          event_listen(canvas, ctx, this.ja)
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
