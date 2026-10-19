<template>
  <GLocalizationProvider :loader="appLocalizationLoader">
    <GIconProvider>
      <GOverlayHost :window-definitions="appWindowCatalog">
        <GToastProvider>
          <div class="ew-app-shell">
            <a class="ew-skip-link ew-button" href="#main-content">
              <GText :content="menuText(menuKeys.skipToContent)" />
            </a>
            <RouterView />
          </div>
        </GToastProvider>
      </GOverlayHost>
    </GIconProvider>
  </GLocalizationProvider>
</template>

<script setup lang="ts">
import {
  GIconProvider,
  GLocalizationProvider,
  GOverlayHost,
  GToastProvider,
} from '@/shared/providers'
import { appLocalizationLoader } from '@/localization/appLocalizationLoader'
import GText from '@/shared/components/content/GText/GText.vue'
import { menuKeys, menuText } from '@/localization/menuText'
import { appWindowCatalog } from '@/windows/appWindowCatalog'
</script>
