<script setup>
import { ref } from 'vue'
import { useTheme } from '../../composables/useTheme'
import { useFractal, useFractalControl } from '../../composables/useFractal'

const canvasRef = ref(null)
const { resolvedTheme } = useTheme()
const { isPaused } = useFractalControl()

useFractal(canvasRef, resolvedTheme, isPaused)
</script>

<template>
  <div id="canvasHolder" aria-hidden="true">
    <canvas ref="canvasRef" id="fractalCanvas"></canvas>
  </div>
</template>

<style scoped>
#canvasHolder {
  position: fixed;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

#fractalCanvas {
  width: 100%;
  height: 100%;
  display: block;
}

@media (forced-colors: active) {
  #canvasHolder {
    display: none;
  }
}
</style>
