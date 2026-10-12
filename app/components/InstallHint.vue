<script setup lang="ts">
const { $pwa } = useNuxtApp()

const dismissed = ref(true)
const isIos = ref(false)
const isStandalone = ref(false)

onMounted(() => {
  dismissed.value = localStorage.getItem('install-dismissed') === '1'
  isIos.value = /iphone|ipad|ipod/i.test(navigator.userAgent)
  isStandalone.value =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
})

const canShow = computed(() =>
  !dismissed.value && !isStandalone.value && ($pwa?.showInstallPrompt || isIos.value)
)

function dismiss() {
  dismissed.value = true
  localStorage.setItem('install-dismissed', '1')
}
</script>

<template>
  <ClientOnly>
    <p>Sur mobile, si le navigateur ne propose pas l'installation, vous pouvez <button v-if="!isIos" class="button" @click="$pwa?.install()">ajouter</button> manuellement.</p>
    <!-- <div v-if="canShow" class="install-hint">
      <p v-if="isIos">
        Pour installer l'application : touchez <strong>Partager</strong> puis
        <strong>Sur l'écran d'accueil</strong>.
      </p>
      <p v-else>Installer l'application sur votre appareil ?</p>
      <div class="install-hint__actions">
        <button class="button" @click="dismiss">Plus tard</button>
      </div>
    </div> -->
  </ClientOnly>
</template>
