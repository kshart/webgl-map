<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <canvas ref="canvas" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import MapViewport from '../webgl/MapViewport/MapViewport'

@Options({
  components: {
  }
})
export default class HomeView extends Vue {
  viewport?: MapViewport = undefined

  mounted () {
    if (!this.$refs.canvas) {
      return
    }
    const canvas = this.$refs.canvas as HTMLCanvasElement
    this.viewport = new MapViewport(canvas)
    this.viewport.renderStart()
  }

  beforeUnmount () {
    if (this.viewport) {
      this.viewport.destroy()
    }
  }
}
</script>

<style scoped>
.home {
  position: relative;
  background: #f00;
  touch-action: none;
}
.home > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
