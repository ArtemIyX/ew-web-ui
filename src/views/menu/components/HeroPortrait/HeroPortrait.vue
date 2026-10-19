<script lang="ts" src="./HeroPortrait.ts"></script>
<template>
  <div class="hero-portrait">
    <GImage
      :source="hero.portrait"
      :alt="menuText(menuKeys.heroPortraitAlt, { heroName: hero.heroName })"
    />
  </div>
</template>
