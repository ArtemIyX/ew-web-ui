<script lang="ts" src="./HeroList.ts"></script>
<template>
  <div class="hero-list" role="list">
    <HeroListItem
      v-for="hero in heroes"
      :key="hero.id"
      :hero="hero"
      :selected="selectedHeroId === hero.id"
      :now-ms="nowMs"
      :action="actionIds[hero.id]"
      @select="emit('select', hero.id)"
      @destroy="emit('destroy', hero.id)"
      @cancel="emit('cancel', hero.id)"
    />
    <p v-if="!heroes.length" class="menu-empty">{{ empty }}</p>
  </div>
</template>
