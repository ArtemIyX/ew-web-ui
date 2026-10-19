<script lang="ts" src="./MenuSelectHeroView.ts"></script>
<template>
  <section class="menu-hero menu-content">
    <div class="menu-stage">
      <h1>{{ title }}</h1>
    </div>
    <section class="hero-panel">
      <HeroList
        :heroes="store.heroes"
        :selected-hero-id="store.selectedHeroId"
        :now-ms="store.nowMs"
        :action-ids="store.actionIds"
        @select="store.selectHero"
        @destroy="store.startHeroDeletion"
        @cancel="store.cancelHeroDeletion"
      />
    </section>
    <button
      class="ew-button ew-button--primary enter-world"
      type="button"
      :disabled="!store.canEnterWorld"
      :aria-busy="store.enterWorldStatus === 'entering'"
      @click="enterWorld"
    >
      {{ store.enterWorldStatus === 'entering' ? entering : enter }}
    </button>
  </section>
</template>
