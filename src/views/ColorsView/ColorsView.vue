<script lang="ts" src="./ColorsView.ts"></script>

<template>
  <main id="main-content" class="ew-page">
    <div class="ew-container ew-container--wide ew-stack">
      <header class="ew-stack">
        <span class="ew-label">Legacy palette / color debug</span>
        <h1 class="ew-title">120-color system</h1>
        <p class="ew-prose ew-visually-muted">
          Every documented L2 ramp from 950, the deepest shade, through 100, the lightest tint.
          Hover a swatch to inspect its token name.
        </p>
      </header>
      <section v-for="ramp in ramps" :key="ramp.name" class="ew-panel ew-stack">
        <div class="ew-panel__header">
          <h2 class="ew-heading">{{ ramp.name }}</h2>
          <span class="ew-meta">10 shades / tints</span>
        </div>
        <div class="ew-color-ramp">
          <div
            v-for="step in ramp.tokens"
            :key="step"
            class="ew-color-swatch"
            :style="{ background: `var(--l2-${ramp.name.toLowerCase()}-${step})` }"
          >
            <span>{{ step }}</span
            ><code>--l2-{{ ramp.name.toLowerCase() }}-{{ step }}</code>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
