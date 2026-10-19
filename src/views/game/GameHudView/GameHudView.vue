<script lang="ts" src="./GameHudView.ts"></script>
<template>
  <main id="main-content" class="ew-game-hud">
    <div class="ew-game-hud__overlay">
      <button
        class="ew-game-debug-button"
        type="button"
        aria-label="Open debug window"
        title="Open debug window"
        @click="openDebugWindow"
      >
        <svg
          class="ew-game-debug-button__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path d="M8.2 8.7 6.8 7.3M15.8 8.7l1.4-1.4M8.1 13.2H5.8M18.2 13.2h-2.3" />
          <path d="M8.2 10.2c.4-2.3 2.1-3.7 3.8-3.7s3.4 1.4 3.8 3.7" />
          <path
            d="M7.5 10.2h9a3.5 3.5 0 0 1 3.5 3.5v1.1a2.2 2.2 0 0 1-2.2 2.2h-.9l-1.5 2.2h-7l-1.5-2.2H6a2.2 2.2 0 0 1-2.2-2.2v-1.1a3.5 3.5 0 0 1 3.7-3.5Z"
          />
          <path d="M9.2 13.7h.1M14.7 13.7h.1M12 15.2v1.6M10.6 16h2.8" />
        </svg>
      </button>
      <GameChat />
      <GameShortcutPanel />
    </div>
  </main>
</template>
