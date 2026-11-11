import { inject, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'

const FRACTAL_KEY = Symbol('fractal-control')

const VERTEX_SHADER = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 v_uv;

uniform float x_min;
uniform float x_max;
uniform float y_min;
uniform float y_max;
uniform vec2  mouse_pos;
uniform float shimmer_speed;
uniform float u_time;
uniform vec3  u_col_a;
uniform vec3  u_col_b;
uniform vec3  u_col_c;

vec3 color_cell(float mu) {
  float shimmer_mu = mu + u_time * shimmer_speed;
  shimmer_mu -= floor(shimmer_mu);
  float scaled_shimmer = shimmer_mu * 2.0;
  scaled_shimmer -= floor(scaled_shimmer);
  float cyclic_scaled_mu = scaled_shimmer;

  vec3 col = u_col_a;
  col = mix(col, u_col_b, smoothstep(0.0,     1.0/3.0, cyclic_scaled_mu));
  col = mix(col, u_col_c, smoothstep(1.0/3.0, 2.0/3.0, cyclic_scaled_mu));
  col = mix(col, u_col_a, smoothstep(2.0/3.0, 1.0,     cyclic_scaled_mu));
  return col;
}

vec3 mandelbrot(vec2 uv) {
  float x = x_min + uv.x * (x_max - x_min);
  float y = y_min + uv.y * (y_max - y_min);
  float xtemp;
  int iter = 0;

  for (int i = 0; i < 16; i++) {
    xtemp = x*x - y*y + mouse_pos.x;
    y     = 2.0*x*y  + mouse_pos.y;
    x     = xtemp;
    iter++;
    if (x*x + y*y > 4.0) break;
  }

  if (iter == 16) return u_col_c;

  for (int extra = 0; extra < 4; extra++) {
    xtemp = x*x - y*y + mouse_pos.x;
    y     = 2.0*x*y  + mouse_pos.y;
    x     = xtemp;
    iter++;
  }

  float modulus = sqrt(x*x + y*y);
  float mu = max(0.0, (float(iter) - log(log(modulus)) / log(2.0))) / 16.0;
  mu = sqrt(mu);
  return color_cell(mu);
}

void main() {
  vec3 col = mandelbrot(v_uv);
  float fade = max(0.0, 3.0 - u_time) / 3.0;
  col = u_col_a * fade + col * (1.0 - fade);
  gl_FragColor = vec4(col, 1.0);
}`

const THEME_PALETTES = {
  light: {
    a: [250 / 255, 248 / 255, 243 / 255],
    b: [242 / 255, 236 / 255, 224 / 255],
    c: [239 / 255, 225 / 255, 214 / 255]
  },
  dark: {
    a: [18 / 255, 17 / 255, 16 / 255],
    b: [46 / 255, 40 / 255, 34 / 255],
    c: [74 / 255, 49 / 255, 37 / 255]
  }
}

const VIEW = { cx: 0.0, cy: 0.0, range: 0.9 }
const ORBIT_CENTER_X = -0.1
const ORBIT_CENTER_Y = 0.0
const ORBIT_RADIUS = 0.4
const ORBIT_SPEED = 0.08

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(info || 'Failed to compile shader')
  }
  return shader
}

export function provideFractalControl() {
  const isPaused = ref(false)
  let reducedMotionMq = null

  function togglePause() {
    isPaused.value = !isPaused.value
  }

  function onMotionChange(event) {
    isPaused.value = event.matches
  }

  onMounted(() => {
    reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    isPaused.value = reducedMotionMq.matches
    reducedMotionMq.addEventListener('change', onMotionChange)
  })

  onBeforeUnmount(() => {
    reducedMotionMq?.removeEventListener('change', onMotionChange)
  })

  const context = {
    isPaused,
    togglePause
  }

  provide(FRACTAL_KEY, context)
  return context
}

export function useFractalControl() {
  const context = inject(FRACTAL_KEY, null)
  if (!context) {
    throw new Error(
      'useFractalControl() must be called inside a component tree where provideFractalControl() was called.'
    )
  }
  return context
}

export function useFractal(canvasRef, resolvedTheme, isPaused) {
  let rafId = null
  let cleanup = null

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return

    const gl = canvas.getContext('webgl', { antialias: false })
    if (!gl) return

    let vertexShader = null
    let fragmentShader = null
    let program = null
    let buffer = null

    try {
      vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
      fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
      program = gl.createProgram()
      if (!vertexShader || !fragmentShader || !program) return

      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'Failed to link program')
      }
      gl.useProgram(program)

      buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
        gl.STATIC_DRAW
      )

      const aPos = gl.getAttribLocation(program, 'a_pos')
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

      const uniforms = {}
      for (const name of [
        'x_min',
        'x_max',
        'y_min',
        'y_max',
        'mouse_pos',
        'shimmer_speed',
        'u_time',
        'u_col_a',
        'u_col_b',
        'u_col_c'
      ]) {
        uniforms[name] = gl.getUniformLocation(program, name)
      }
      gl.uniform1f(uniforms.shimmer_speed, 0.1)

      const applyPalette = (mode) => {
        const palette = THEME_PALETTES[mode] ?? THEME_PALETTES.light
        gl.uniform3fv(uniforms.u_col_a, palette.a)
        gl.uniform3fv(uniforms.u_col_b, palette.b)
        gl.uniform3fv(uniforms.u_col_c, palette.c)
      }

      const setView = () => {
        if (!canvas.height) return
        const aspect = canvas.width / canvas.height
        gl.uniform1f(uniforms.x_min, VIEW.cx - VIEW.range * aspect)
        gl.uniform1f(uniforms.x_max, VIEW.cx + VIEW.range * aspect)
        gl.uniform1f(uniforms.y_min, VIEW.cy - VIEW.range)
        gl.uniform1f(uniforms.y_max, VIEW.cy + VIEW.range)
      }

      let elapsedSeconds = isPaused.value ? 3.0 : 0.0
      let lastFrameTime = null

      const drawAt = (t) => {
        gl.uniform1f(uniforms.u_time, t)
        const angle = t * ORBIT_SPEED * Math.PI * 2
        gl.uniform2f(
          uniforms.mouse_pos,
          ORBIT_CENTER_X + Math.cos(angle) * ORBIT_RADIUS,
          ORBIT_CENTER_Y + Math.sin(angle) * ORBIT_RADIUS
        )
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }

      const resize = () => {
        const dpr = window.devicePixelRatio || 1
        canvas.width = Math.max(1, canvas.clientWidth * dpr)
        canvas.height = Math.max(1, canvas.clientHeight * dpr)
        gl.viewport(0, 0, canvas.width, canvas.height)
        setView()
        drawAt(elapsedSeconds)
      }

      const tick = (now) => {
        if (isPaused.value) {
          rafId = null
          lastFrameTime = null
          return
        }
        if (lastFrameTime !== null) {
          elapsedSeconds += (now - lastFrameTime) / 1000
        }
        lastFrameTime = now
        drawAt(elapsedSeconds)
        rafId = requestAnimationFrame(tick)
      }

      const startLoop = () => {
        if (rafId !== null) return
        lastFrameTime = performance.now()
        rafId = requestAnimationFrame(tick)
      }

      const stopLoop = () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
          rafId = null
        }
        lastFrameTime = null
      }

      applyPalette(resolvedTheme.value)
      window.addEventListener('resize', resize)
      resize()

      const stopThemeWatch = watch(resolvedTheme, (mode) => {
        applyPalette(mode)
        drawAt(elapsedSeconds)
      })

      const stopPauseWatch = watch(
        isPaused,
        (paused) => {
          if (paused) {
            stopLoop()
            if (elapsedSeconds < 3.0) {
              elapsedSeconds = 3.0
            }
            drawAt(elapsedSeconds)
          } else {
            startLoop()
          }
        },
        { immediate: true }
      )

      cleanup = () => {
        stopLoop()
        stopThemeWatch()
        stopPauseWatch()
        window.removeEventListener('resize', resize)
        if (buffer) gl.deleteBuffer(buffer)
        if (program) gl.deleteProgram(program)
        if (vertexShader) gl.deleteShader(vertexShader)
        if (fragmentShader) gl.deleteShader(fragmentShader)
      }
    } catch {
      // Fallback cleanly to solid CSS background color if WebGL shader fails
    }
  })

  onBeforeUnmount(() => {
    cleanup?.()
  })
}
