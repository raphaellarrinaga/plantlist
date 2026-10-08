<template>
  <div class="content">
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

      <div class="main-text l-constrain">
        <div class="text-content">
          <h3>Retours & contributions</h3>
          <p>Application en cours de développement et données en cours de complétion.</p>
          <p>N'hésitez pas à m'envoyer des retours <a href='mai&#108;t&#111;&#58;&#114;&#97;ph%61e&#108;&#46;l&#97;rri%&#54;E&#97;ga&#64;&#37;67%6D&#97;%6&#57;l&#46;co&#37;6D'>par mail</a> ou message.</p>
          <h3>Mobile & smartphone</h3>
          <p>L'application est adaptée pour une utilisation sur mobile et smartphone. Via le navigateur web du smartphone, un message peut apparaître pour proposer l'installation de l'application. Sinon, aller dans les options de la page, en général "Ajouter à l'écran d'accueil".</p>
          <h3>Données et filtre "Source"</h3>
          <p>Certaines plantes peuvent être présentes sans que toutes les données soient complétées.</p>
          <p>Le choix des plantes a été fait en fonction des sources ci-dessous. Les détails sont soit complétés par moi-même, soit rédigés par IA (infos numériques).</p>
          <p>Les données sont partagées entre la liste, le quiz.</p>
          <ul>
            <li>Ecosem: plantes produites chez Ecosem (2022).</li>
            <li>Ecoflora: plantes présentes sur le site (2022).</li>
            <li>IFAPME: plantes ornementales à connaitre dans le cadre de la formation en Parcs et jardins.</li>
            <li>Natagora: principales plantes indigènes et indicatrices à connaitre dans le cadre de la formation <a href="https://www.natagora.be/news/biodiversite-en-espaces-verts-une-formation-pour-les-professionnels-du-secteur">Biodiversité en espaces verts</a></li>
            <li>Autre: autres plantes, notamment toutes les plantes ligneuses de Belgique, certaines invasives et d'autres ornementales ou indigènes intéressantes.</li>
          </ul>
          <h3>Fonctionnement de la page liste</h3>
          <ul>
            <li>Les filtres n'affichent les résultats que pour les plantes dont l'info en question a été complétée. Par exemple, si vous filtrez par couleur en choisissant le "Jaune", il y a peut être 10 plantes qui s'affichent mais si 20 autres plantes ont aussi les fleurs jaunes mais que ce champs n'a pas été complété pour celles là elles ne s'afficheront pas.</li>
            <li>Idem pour les icones à droite du nom des plantes, celles qui ne sont pas complétées entièrement n'afficheront pas l'icone donc ce n'est pas parce qu'elle n'a pas l'icone qu'elle n'a pas le critère en question (comestible, toxique, indigène, etc.)</li>
            <li>Les filtres sont multiples quand c'est possible. Dans le filtre "Type" par exemple, une plante peut avoir le type "Arbre" mais aussi "Conifère". Elle apparaitra dans les deux cas. Pareil pour l'exposition si elle accepte l'ombre et la mi-ombre. Ou la couleur de la fleur si elle est mauve et qu'elle comporte aussi du jaune ou que les fleurs sont parfois considées bleues ou violet comme le bleuet par exemple.</li>
            <li>Le click sur une vignette de photos affiche le ou les images disponibles en grand. Le numéro en bas à droite de la vignette correspond au nombre d'images pour la plante.</li>
          </ul>
          <h3>Exemples de cas d'utilisation de la page liste</h3>
          <ul>
            <li>Choisir une plante pour un cas d'utilisation précis : composer un massif ou une haie, choisir un couvre-sol, des plantes pour mare, etc.</li>
            <li>Lister les plantes invasives en Belgique</li>
            <li>Lister les plantes ligneuses de Belgique</li>
            <li>Savoir à quoi ressemble une plante donnée</li>
            <li>
              Exemples types :
              <ul>
                <li>Afficher une liste de sujets pour une haie indigène, comestible, de max 4m de haut.</li>
                <li>Afficher une liste de vivaces aux fleurs bleues ou jaunes qui fleurissent en juin pour composer un massif.</li>
                <li>Afficher une liste de plantes qui se plaisent à l'ombre, d'une hauteur max de 80cm pour composer un massif.</li>
                <li>Savoir quelles sont les espèces de centaurée.</li>
              </ul>
            </li>
          </ul>
          <h3>Crédits photos</h3>
          <ul v-if="creditsBySource.length">
            <li v-for="g in creditsBySource" :key="g.source">
              <strong>{{ g.source }}</strong> : {{ g.authors.join(', ') }}
            </li>
          </ul>
          <!-- <ul v-if="credits.length">
            <li v-for="c in credits" :key="`${c.author}|${c.source}`">
              {{ c.author }}<template v-if="c.source">, {{ c.source }}</template>
            </li>
          </ul> -->
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlantsStore } from '~/stores/plants'

const store = usePlantsStore()

type Credit = { author: string; source: string }

const credits = computed(() => {
  const unique = new Map<string, Credit>()

  const add = (credit: Credit | null | undefined) => {
    if (!credit?.author) return
    const key = `${credit.author}|${credit.source}`.toLowerCase()
    if (!unique.has(key)) unique.set(key, credit)
  }

  for (const plant of store.plants as any[]) {
    plant.images.forEach((img: any) => add(img.credit))
    add(plant.thumbnailCredit)
  }

  return [...unique.values()].sort((a, b) =>
    a.source.localeCompare(b.source) || a.author.localeCompare(b.author)
  )
})

const creditsBySource = computed(() => {
  const groups = new Map<string, string[]>()
  for (const c of credits.value) {
    const source = c.source || 'Autre'
    if (!groups.has(source)) groups.set(source, [])
    groups.get(source)!.push(c.author)
  }
  return [...groups.entries()].map(([source, authors]) => ({ source, authors }))
})
</script>
