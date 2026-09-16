<script setup>
const installPrompt = ref(null)
const isHidden = ref(false) // État pour la fermeture manuelle

onMounted(() => {
  // On vérifie si l'utilisateur a déjà fermé la bannière durant cette session
  const hasDismissed = sessionStorage.getItem('pwa_dismissed')
  if (hasDismissed) {
    isHidden.value = true
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    installPrompt.value = e
  })
})

const triggerInstall = async () => {
  if (!installPrompt.value) return
  installPrompt.value.prompt()
  const { outcome } = await installPrompt.value.userChoice
  if (outcome === 'accepted') {
    installPrompt.value = null
  }
}

const dismissBanner = () => {
  isHidden.value = true
  // On s'en souvient pour la session actuelle
  sessionStorage.setItem('pwa_dismissed', 'true')
}
</script>

<template>
  <div v-if="installPrompt && !isHidden" class="pwa-banner">
    <div class="content">
      <p>Installer <strong>Plant Quiz</strong> sur votre écran d'accueil ?</p>
      <div class="actions">
        <button class="btn-install" @click="triggerInstall">Installer</button>
        <button class="btn-close" @click="dismissBanner" aria-label="Fermer">✕</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pwa-banner {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: #541E76;
  color: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.2;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-install {
  background: #41b883; /* Vert Nuxt pour attirer l'oeil */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
}

.btn-close {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
}

/* Version desktop plus discrète */
@media (min-width: 768px) {
  .pwa-banner {
    width: 350px;
    left: 20px;
    right: auto;
  }
}
</style>
