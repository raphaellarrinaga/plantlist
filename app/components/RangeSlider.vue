<script setup lang="ts">
const props = defineProps<{
  modelValue: [number, number]
  min: number
  max: number
  step?: number
  unit?: string
  stops?: number[]
  formatLabel?: (v: number) => string
}>()
const emit = defineEmits<{ 'update:modelValue': [[number, number]] }>()

const scale = computed(() => (props.stops?.length ? props.stops : null))
const sliderMin = computed(() => (scale.value ? 0 : props.min))
const sliderMax = computed(() => (scale.value ? scale.value.length - 1 : props.max))
const sliderStep = computed(() => (scale.value ? 1 : (props.step ?? 10)))

// Valeur (cm) → position du curseur. On arrondit vers l'intérieur de la plage
// pour qu'une valeur saisie à la main (ex. 175) ne soit jamais exclue.
function toPosition(value: number, round: 'down' | 'up') {
  const s = scale.value
  if (!s) return value
  if (round === 'down') {
    let idx = 0
    s.forEach((v, i) => { if (v <= value) idx = i })
    return idx
  }
  const idx = s.findIndex(v => v >= value)
  return idx === -1 ? s.length - 1 : idx
}

function toValue(position: number) {
  return scale.value ? scale.value[position] : position
}

const positions = computed<[number, number]>(() => [
  toPosition(props.modelValue[0], 'down'),
  toPosition(props.modelValue[1], 'up'),
])

function updateMin(e: Event) {
  const value = toValue(Number((e.target as HTMLInputElement).value))
  emit('update:modelValue', [Math.min(value, props.modelValue[1]), props.modelValue[1]])
}

function updateMax(e: Event) {
  const value = toValue(Number((e.target as HTMLInputElement).value))
  emit('update:modelValue', [props.modelValue[0], Math.max(value, props.modelValue[0])])
}

const trackFillStyle = computed(() => {
  const range = sliderMax.value - sliderMin.value || 1
  const left = ((positions.value[0] - sliderMin.value) / range) * 100
  const right = ((positions.value[1] - sliderMin.value) / range) * 100
  return { left: `${left}%`, width: `${right - left}%` }
})

function label(v: number) {
  return props.formatLabel ? props.formatLabel(v) : `${v}${props.unit ?? ''}`
}
</script>

<template>
  <div class="range-slider">
    <div class="range-slider__track">
      <div class="range-slider__fill" :style="trackFillStyle" />
    </div>
    <input
      type="range" class="range-slider__input"
      :min="sliderMin" :max="sliderMax" :step="sliderStep"
      :value="positions[0]" @input="updateMin"
    >
    <input
      type="range" class="range-slider__input"
      :min="sliderMin" :max="sliderMax" :step="sliderStep"
      :value="positions[1]" @input="updateMax"
    >
    <div class="range-slider__labels">
      <span>{{ label(modelValue[0]) }}</span>
      <span>{{ label(modelValue[1]) }}</span>
    </div>
  </div>
</template>

<style scoped>
.range-slider {
  position: relative;
  padding-top: .25rem;
}
.range-slider__track {
  position: relative; height: 4px; background: #ddd; border-radius: 2px;
}
.range-slider__fill {
  position: absolute; height: 100%; background: #2e7d32; border-radius: 2px;
}
.range-slider__input {
  position: absolute; top: .4rem; left: 0; width: 100%;
  -webkit-appearance: none; appearance: none; background: transparent;
  pointer-events: none; margin: 0;
}
.range-slider__input::-webkit-slider-thumb {
  -webkit-appearance: none; pointer-events: auto;
  width: 16px; height: 16px; border-radius: 50%;
  background: #2e7d32; cursor: pointer; margin-top: -8px;
  border: 2px solid #fff;
}
.range-slider__input::-moz-range-thumb {
  pointer-events: auto; width: 16px; height: 16px; border-radius: 50%;
  background: #2e7d32; border: none; cursor: pointer;
}
.range-slider__labels {
  color: #666;
  display: flex;
  font-size: 0.85rem;
  margin-top: 0.45rem;
  justify-content: space-between;
}
</style>
