<script lang="ts" src="./MenuConnectView.ts"></script>
<template>
  <section class="menu-connect menu-content">
    <div class="menu-copy">
      <h1>{{ title }}</h1>
    </div>
    <form class="menu-form" @submit.prevent="submit">
      <label>{{ sid }}<input v-model="sessionId" autocomplete="off" /></label
      ><label>{{ loginLabel }}<input v-model="login" autocomplete="username" /></label>
      <p
        v-if="store.connectionStatus === MenuConnectionStatus.Error"
        class="menu-error"
        role="alert"
      >
        {{ error }}
      </p>
      <button
        class="ew-button ew-button--primary"
        type="submit"
        :disabled="store.connectionStatus === MenuConnectionStatus.Connecting"
      >
        {{ store.connectionStatus === MenuConnectionStatus.Connecting ? connecting : connect }}
      </button>
    </form>
  </section>
</template>
