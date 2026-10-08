<script setup lang="ts">
// Umami tracking is disabled on this page, so we can set the localStorage value to disable it for the whole site.
// Load this page on every browser to ensure the localStorage value is set.
onMounted(() => localStorage.setItem('umami.disabled', '1'))
</script>

<template>
  <p>Tes visites sont désormais exclues des statistiques sur cet appareil.</p>
</template>
