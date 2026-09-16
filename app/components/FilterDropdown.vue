<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{
  icon: string
  label: string
  values: string[]
  modelValue: string | string[]
  multiple?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [string | string[]] }>()

const open = ref(false)
const target = ref(null)
onClickOutside(target, () => (open.value = false))

const isActive = (v: string) =>
  props.multiple ? (props.modelValue as string[]).includes(v) : props.modelValue === v

const displayText = () => {
  if (props.multiple) {
    const arr = props.modelValue as string[]
    if (arr.length === 0) return props.label
    if (arr.length === 1) return arr[0]
    return 'Multiple'
  }
  return props.modelValue === 'all' ? props.label : (props.modelValue as string)
}

function select(value: string) {
  if (value === 'all') {
    emit('update:modelValue', props.multiple ? [] : 'all')
    if (!props.multiple) open.value = false
    return
  }
  if (props.multiple) {
    const arr = [...(props.modelValue as string[])]
    const i = arr.indexOf(value)
    i === -1 ? arr.push(value) : arr.splice(i, 1)
    emit('update:modelValue', arr)
  } else {
    emit('update:modelValue', value)
    open.value = false
  }
}
</script>

<template>
  <div ref="target" class="form-item form-item--dropdown">
    <p
      class="dropdown-toggle button button--form"
      :class="{ 'is-active': multiple ? (modelValue as string[]).length : modelValue !== 'all' }"
      @click="open = !open"
    >
      {{ icon }} {{ displayText() }} ▾
    </p>
    <ul v-show="open" class="dropdown" :class="{ 'dropdown--multiple': multiple }">
      <li :class="{ 'is-active': multiple ? (modelValue as string[]).length === 0 : modelValue === 'all' }" @click="select('all')">
        Tout
      </li>
      <li v-for="v in values" :key="v" :class="{ 'is-active': isActive(v) }" @click="select(v)">
        {{ v }}
      </li>
    </ul>
  </div>
</template>
