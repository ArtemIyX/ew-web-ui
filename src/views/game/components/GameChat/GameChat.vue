<script lang="ts" src="./GameChat.ts"></script>
<template>
  <section
    ref="root"
    class="ew-chat"
    :data-resizing="resizing"
    :data-resize-visible="resizeHandleVisible"
    @pointerenter="showResizeHandle"
    @pointerleave="hideResizeHandle"
    @focusin="showResizeHandle"
    :style="{
      '--ew-chat-inline': `${size.inline / 16}rem`,
      '--ew-chat-block': `${size.block / 16}rem`,
    }"
    :aria-label="chatLabel"
  >
    <button
      class="ew-chat__resize"
      type="button"
      :aria-label="resizeLabel"
      :aria-valuetext="`${size.inline} by ${size.block}`"
      @pointerdown="start"
      @keydown="keydown"
    />
    <div ref="history" class="ew-chat__history" role="log" aria-live="off">
      <ul class="ew-chat__messages">
        <li
          v-for="message in messages"
          :key="message.id"
          class="ew-chat__message"
          :data-channel="message.channel"
          :aria-label="`${message.channel}: ${message.body}`"
        >
          <span>{{ message.body }}</span>
        </li>
      </ul>
      <p v-if="!messages.length" class="ew-chat__empty">
        <GText :content="gameText(gameKeys.empty)"/>
      </p>
    </div>
    <div class="ew-chat__rail" role="tablist">
      <button
        v-for="(item, index) in labels"
        :key="item.channel"
        class="ew-chat__tab"
        type="button"
        role="tab"
        :aria-selected="selectedChannel === item.channel"
        :tabindex="selectedChannel === item.channel ? 0 : -1"
        @click="selectChannel(item.channel)"
        @keydown="moveChannel($event, index)"
      >
        <GText :content="item.content"/>
      </button>
    </div>
    <form class="ew-chat__form" @submit.prevent="send">
      <input
      id="game-chat-input"
      ref="input"
      v-model="draft"
      class="ew-chat__input"
      :placeholder="placeholder"
      autocomplete="off"
    />
    </form>
  </section>
</template>
