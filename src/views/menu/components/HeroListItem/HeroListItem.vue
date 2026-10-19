<script lang="ts" src="./HeroListItem.ts"></script>
<template>
  <article
    class="hero-item"
    :class="{ 'is-selected': selected, 'is-deleting': hero.deletionDeadlineMs !== null }"
  >
    <button
      class="hero-select"
      type="button"
      :disabled="hero.deletionDeadlineMs !== null"
      :aria-pressed="selected"
      @click="emit('select')"
    >
      <HeroPortrait :hero="hero" /><span class="hero-details"
        ><span class="hero-level">#LVL {{ hero.level }}</span
        ><small>{{ hero.heroName }}</small
        ><strong>{{ hero.playerName }}</strong></span
      >
    </button>
    <div class="hero-action">
      <template v-if="hero.deletionDeadlineMs !== null"
        ><span class="hero-countdown">{{ time }}</span
        ><button class="ew-button ew-button--secondary" type="button" @click="emit('cancel')">
          {{ cancel }}
        </button></template
      ><button v-else class="ew-button ew-button--danger" type="button" @click="emit('destroy')">
        {{ destroy }}
      </button>
    </div>
    <span v-if="hero.deletionDeadlineMs !== null" class="sr-only">{{ deleting }}</span>
  </article>
</template>
