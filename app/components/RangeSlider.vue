<script setup lang="ts">
const props = defineProps<{
  modelValue: [number, number]
  min: number
  max: number
  step?: number
  unit?: string
  formatLabel?: (v: number) => string
}>()
const emit = defineEmits<{ 'update:modelValue': [[number, number]] }>()

function updateMin(e: Event) {
  const value = Number((e.target as HTMLInputElement).value)
  emit('update:modelValue', [Math.min(value, props.modelValue[1]), props.modelValue[1]])
}
function updateMax(e: Event) {
  const value = Number((e.target as HTMLInputElement).value)
  emit('update:modelValue', [props.modelValue[0], Math.max(value, props.modelValue[0])])
}

const trackFillStyle = computed(() => {
  const range = props.max - props.min || 1
  const left = ((props.modelValue[0] - props.min) / range) * 100
  const right = ((props.modelValue[1] - props.min) / range) * 100
  return { left: `${left}%`, width: `${right - left}%` }
})
</script>

<template>
  <div class="range-slider">
    <div class="range-slider__track">
      <div class="range-slider__fill" :style="trackFillStyle" />
    </div>
    <input
      type="range" class="range-slider__input"
      :min="min" :max="max" :step="step ?? 10"
      :value="modelValue[0]" @input="updateMin"
    >
    <input
      type="range" class="range-slider__input"
      :min="min" :max="max" :step="step ?? 10"
      :value="modelValue[1]" @input="updateMax"
    >
    <div class="range-slider__labels">
      <span>{{ formatLabel ? formatLabel(modelValue[0]) : `${modelValue[0]}${unit ?? ''}` }}</span>
      <span>{{ formatLabel ? formatLabel(modelValue[1]) : `${modelValue[1]}${unit ?? ''}` }}</span>
    </div>
  </div>
</template>

<style scoped>
.range-slider { position: relative; padding: 1.5rem 0 0.5rem; }
.range-slider__track {
  position: relative; height: 4px; background: #ddd; border-radius: 2px;
}
.range-slider__fill {
  position: absolute; height: 100%; background: #2e7d32; border-radius: 2px;
}
.range-slider__input {
  position: absolute; top: 1.5rem; left: 0; width: 100%;
  -webkit-appearance: none; appearance: none; background: transparent;
  pointer-events: none; margin: 0;
}
.range-slider__input::-webkit-slider-thumb {
  -webkit-appearance: none; pointer-events: auto;
  width: 16px; height: 16px; border-radius: 50%;
  background: #2e7d32; cursor: pointer; margin-top: -8px;
}
.range-slider__input::-moz-range-thumb {
  pointer-events: auto; width: 16px; height: 16px; border-radius: 50%;
  background: #2e7d32; border: none; cursor: pointer;
}
.range-slider__labels {
  display: flex; justify-content: space-between; font-size: 0.85rem; color: #666;
}
</style>
