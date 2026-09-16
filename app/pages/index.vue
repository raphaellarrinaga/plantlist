<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">
        <NuxtLink to="/" class="nav-list__link">
          <span class="page-title__text">Plantlist</span>
          <img src="~/assets/images/logo.svg" data-not-lazy />
        </NuxtLink>
      </h1>

      <MainNavigation/>
    </header>

    <PlantFilter v-if="store.plants.length" />

    <div v-if="store.layout === 'table'" class="plants__header l-constrain">
      <span class="plants__header-latin">Nom</span>
      <span class="plants__header-categorie">Catégorie</span>
      <span class="plants__header-type">Type</span>
      <span class="plants__header-hauteur">Taille</span>
      <span class="plants__header-floraison">Floraison</span>
      <span class="plants__header-couleur">Fleur</span>
      <span class="plants__header-actions" />
    </div>

    <div class="plants l-constrain">
      <div v-if="store.filteredPlants.length" :class="{ 'plants-layout-grid': store.layout === 'grid' }">
        <article
          v-for="plant in store.filteredPlants"
          :key="plant.slug"
          class="plant"
          :class="{ 'plant--table': store.layout === 'table', 'plant--grid': store.layout === 'grid' }"
        >
          <PlantCard :plant="plant" />
        </article>
      </div>
      <h4 v-else>Pas de résultat pour ce filtre.</h4>
    </div>

  </div>
</template>

<script setup lang="ts">
import { usePlantsStore } from '~/stores/plants'
const store = usePlantsStore()
</script>

<style lang="scss">
.plants-layout-grid {
  > * {
    margin-bottom: 1rem;

    @media screen and (min-width: 460px) {
      margin-bottom: 0;
    }
  }

  @media screen and (min-width: 460px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media screen and (min-width: 1000px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  @media screen and (min-width: 1400px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.plants__header {
  border-bottom: 1px solid $border;
  border-top: 1px solid $border;
  font-weight: bold;
  margin-bottom: .5rem;
  padding-bottom: .5rem;
  padding-top: .5rem;
  display: none;

  @media screen and (min-width: 821px) {
    display: flex;
  }

  span {
    color: #777;
    flex: 0 0 12%;
    font-size: 10px;
    font-weight: 500;
    padding-right: 1rem;
    text-transform: uppercase;
  }

  .plants__header-latin {
    @media screen and (min-width: 821px) {
      flex-basis: 41%;
    }
    @media screen and (min-width: 1021px) {
      flex-basis: 32%;
    }
  }

  .plants__header-categorie {
    @media screen and (min-width: 821px) {
      flex: 0 0 16%;
    }

    @media screen and (min-width: 1021px) {
      flex-basis: 14%;
    }
  }

  .plants__header-type {
    @media screen and (min-width: 821px) {
      flex: 0 0 16%;
    }

    @media screen and (min-width: 1021px) {
      flex-basis: 24%;
    }
  }

  .plants__header-hauteur,
  .plants__header-floraison {
    @media screen and (min-width: 821px) {
      flex: 0 0 9%;
    }

    @media screen and (min-width: 1021px) {
      flex-basis: 7%;
    }
  }

  .plants__header-couleur {
    @media screen and (min-width: 821px) {
      flex: 0 0 9%;
    }

    @media screen and (min-width: 1021px) {
      flex-basis: 10%;
    }
  }
}

span.plants__header-actions {
  flex-basis: 0%;
  padding-right: 0;

  @media screen and (min-width: 1021px) {
    flex: 0 0 6%;
  }
}

.plants {
  padding-bottom: 3rem;
}
</style>
