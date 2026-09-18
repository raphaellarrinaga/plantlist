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
          <h3>Données et filtre "Source"</h3>
          <ul>
            <li>Ecosem: plantes produites chez Ecosem</li>
            <li>Ecoflora: plantes présentes sur leur site</li>
            <li>IFAPME: plantes ornementales à connaitre dans le cadre de leur formation en Parcs et jardins.</li>
            <li>Natagora: principales plantes indigènes et indicatrices à connaitre dans le cadre de leur formation <a href="https://www.natagora.be/news/biodiversite-en-espaces-verts-une-formation-pour-les-professionnels-du-secteur">Biodiversité en espaces verts</a></li>
            <li>Autre: autres plantes ajoutées par mes soins notamment toutes les plantes ligneuses de Belgique et certaines invasives ou ornementales.</li>
          </ul>
          <h3>Contribuer</h3>
          <p>Les contributions sont les bienvenues. N'hésitez pas aussi à m'envoyer vos retours <a href="https://larrinaga-jardins.be/">par mail</a>.</p>
          <h3>Fonctionnement</h3>
          <ul>
            <li>Pour réinitialiser les filtres il faut recharger la page ou les remettre à 0 un par un.</li>
            <li>Les filtres n'affichent les résultats que pour les plantes dont l'info en question a été complétée. Par exemple, si vous filtrez par couleur en choisissant le "Jaune", il y a peut être 10 plantes qui s'affichent mais si 20 autres plantes ont aussi les fleurs jaunes mais que ce champs n'a pas été complété pour celles là elles ne s'afficheront pas.</li>
            <li>Idem pour les icones à droite du nom des plantes, celles qui ne sont pas complétées entièrement n'afficheront pas l'icone donc ce n'est pas parce qu'elle n'a pas l'icone qu'elle n'a pas le critère en question (comestible, toxique, indigène, etc.)</li>
            <li>Les filtres sont multiples quand c'est possible. Dans le filtre "Type" par exemple, une plante peut avoir le type "Arbre" mais aussi "Conifère". Elle apparaitra dans les deux cas. Pareil pour l'exposition si elle accepte l'ombre et la mi-ombre. Ou la couleur de la fleur si elle est mauve et qu'elle comporte aussi du jaune ou que les fleurs sont parfois considées bleues ou violet comme le bleuet par exemple.</li>
            <li>Le click sur une vignette de photos affiche le ou les images disponibles en grand. Le numéro en bas à droite de la vignette correspond au nombre d'images pour la plante.</li>
            <li>Pour la Roadmap technique, l'ajout de fonctionnalités, etc., voir le fichier <a href="https://github.com/raphaellarrinaga/plantlist/blob/main/README.md">Readme</a>.</li>
          </ul>
          <h3>Exemples de cas d'utilisation</h3>
          <ul>
            <li>Composer un massif</li>
            <li>Choisir une plante pour un cas d'utilisation précis (composer une haie, couvre-sol, etc.)</li>
            <li>En savoir plus sur une plante</li>
            <li>Savoir à quoi ressemble une plante donnée</li>
            <li>Connaitre la liste des plantes invasives en Belgique</li>
            <li>Etc.</li>
            <li>
              Exemples types :
              <ul>
                <li>Afficher une liste de sujets pour une haie indigène, comestible, de max 2m de haut.</li>
                <li>Afficher une liste de vivaces aux fleurs bleues ou jaunes qui fleurissent en juin pour composer un massif.</li>
                <li>Afficher une liste de plantes qui se plaisent à l'ombre, d'une hauteur max de 80cm pour composer un massif.</li>
                <li>Savoir à quoi ressemblent les feuilles et fleurs de l'Achillée.</li>
                <li>En savoir plus sur les caractéristiques d'une plante dont je connais le nom.</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'Infos',
}
</script>
