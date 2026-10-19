<script lang="ts" src="./DebugView.ts"></script>

<template>
  <main id="main-content" class="ew-page">
    <div class="ew-container ew-container--wide ew-stack" style="--ew-stack-gap: var(--ew-space-7)">
      <header class="ew-stack">
        <GLabel>Shared component reference</GLabel>
        <h1 class="ew-title">Component atlas</h1>
        <p class="ew-prose ew-visually-muted">
          A live reference for the released shared components, their core states, and the primitives
          they build on.
        </p>
      </header>

      <GWindow
        v-model:open="showWindowSample"
        window-id="debug.window-titleless"
        aria-label="Titleless window sample"
        :header-placement="windowHeaderPlacement"
        :header-size="windowHeaderSize"
        :surface="windowSurface"
        :header-surface="windowHeaderSurface"
        :opacity="windowOpacity"
        :closable="false"
        :default-width="30 * 16"
        :default-height="18 * 16"
      >
        <GInset>
          <p class="ew-prose">Sample content for reviewing a titleless, persistent window.</p>
        </GInset>
      </GWindow>

      <GWindow
        v-model:open="showClassicWindowSample"
        window-id="debug.window-classic"
        title="Settings sample"
        aria-label="Settings window sample"
        header-placement="top"
        :title-size="windowTitleSize"
        :header-size="windowHeaderSize"
        :surface="windowSurface"
        :header-surface="windowHeaderSurface"
        :opacity="windowOpacity"
        :closable="true"
      >
        <GTabs>
          <GTab :selected="true">Interface</GTab>
          <GTab>Controls</GTab>
          <GTab>Audio</GTab>
        </GTabs>
        <div class="ew-panel__body" style="margin-block-start: var(--ew-space-4)">
          <GField>
            <GLabel>Interface scale</GLabel>
            <GFormHint>Comfortable spacing for menus and windows.</GFormHint>
          </GField>
          <div class="ew-cluster">
            <GButton variant="primary">Save</GButton>
            <GButton variant="ghost">Back</GButton>
          </div>
        </div>
      </GWindow>

      <GPanel>
        <div class="ew-panel__header">
          <h2 class="ew-heading">Window framework</h2>
          <GBadge>local component samples</GBadge>
        </div>
        <p class="ew-prose ew-visually-muted">
          Review the reusable move rail at each edge. These examples are local component samples,
          not live game windows.
        </p>
          <div class="ew-window-debug__controls">
          <GField>
            <GLabel>Header placement</GLabel>
            <GSelect
              v-model="windowHeaderPlacement"
              :options="windowHeaderPlacements.map((value) => ({ value, label: value }))"
            />
          </GField>
          <GField>
            <GLabel>Title size</GLabel>
            <GSelect
              v-model="windowTitleSize"
              :options="windowTitleSizes.map((value) => ({ value, label: value }))"
            />
          </GField>
          <GField>
            <GLabel>Header size</GLabel>
            <GSelect
              v-model="windowHeaderSize"
              :options="windowHeaderSizes.map((value) => ({ value, label: value }))"
            />
          </GField>
          <GField>
            <GLabel>Window surface</GLabel>
            <GSelect
              v-model="windowSurface"
              :options="windowSurfaces.map((value) => ({ value, label: value }))"
            />
          </GField>
          <GField>
            <GLabel>Header surface</GLabel>
            <GSelect
              v-model="windowHeaderSurface"
              :options="windowSurfaces.map((value) => ({ value, label: value }))"
            />
          </GField>
          <GField>
            <GLabel>Surface opacity</GLabel>
            <GSlider v-model="windowOpacity" :min="0.2" :max="1" :step="0.05" />
            <GFormHint>{{ Math.round(windowOpacity * 100) }}% surface opacity</GFormHint>
          </GField>
          <div class="ew-cluster">
            <GButton @click="showWindowSample = true">Open titleless sample</GButton>
            <GButton variant="secondary" @click="showClassicWindowSample = true">
              Open classic sample
            </GButton>
            <GButton variant="ghost" @click="showWindowSample = false">Reset sample</GButton>
          </div>
        </div>
        <div class="ew-window-debug__previews">
          <WindowPlacementPreview
            v-for="placement in windowHeaderPlacements"
            :key="placement"
            :placement="placement"
            :active="placement === 'top'"
          />
        </div>
      </GPanel>

      <GPanel>
        <div class="ew-panel__header">
          <h2 class="ew-heading">Foundation tokens</h2>
          <GBadge>system palette</GBadge>
        </div>
        <div class="ew-grid" style="--ew-grid-min: 9rem">
          <GCard v-for="[name, token] in colors" :key="token">
            <GStatus>
              <span
                class="ew-token-swatch"
                :style="{ '--ew-swatch-color': `var(${token})` }"
              ></span>
              <span>
                <strong>{{ name }}</strong>
                <br />
                <code class="ew-caption">{{ token }}</code>
              </span>
            </GStatus>
          </GCard>
        </div>
      </GPanel>

      <GPanel>
        <div class="ew-panel__header">
          <h2 class="ew-heading">Progress bars</h2>
          <GBadge>interactive samples</GBadge>
        </div>
        <p class="ew-prose ew-visually-muted">
          These examples exercise the shared progress contract with local controls. They are
          component samples, not live game state.
        </p>
        <div class="ew-progress-debug__controls">
          <GButtonGroup>
            <GButton @click="debugPercentage = Math.max(0, debugPercentage - 10)"
              >Decrease 10%</GButton
            >
            <GButton @click="debugPercentage = Math.min(100, debugPercentage + 10)"
              >Increase 10%</GButton
            >
            <GButton variant="ghost" @click="debugPercentage = 62">Reset</GButton>
          </GButtonGroup>
          <GField>
            <GLabel>Animation</GLabel>
            <GSelect
              v-model="debugAnimation"
              :options="progressAnimations.map((value) => ({ value, label: value }))"
            />
          </GField>
          <GField>
            <GLabel>Animation speed</GLabel>
            <GSlider v-model="debugDuration" :min="0" :max="1000" :step="40" />
            <GFormHint>{{ debugDuration }} ms transition</GFormHint>
          </GField>
          <GField>
            <GLabel>Semantic tone</GLabel>
            <GSelect
              v-model="debugTone"
              :options="progressTones.map((value) => ({ value, label: value }))"
            />
          </GField>
          <GField>
            <GLabel>Fill</GLabel>
            <GButtonGroup>
              <GButton @click="debugFill = { kind: 'tone' }">Tone</GButton>
              <GButton @click="debugFill = { kind: 'gradient', variant: 'gradient-24' }"
                >Library gradient</GButton
              >
              <GButton
                @click="
                  debugFill = {
                    kind: 'css',
                    value:
                      'linear-gradient(90deg, var(--ew-color-sapphire-400), var(--ew-color-bronze-300))',
                  }
                "
                >CSS gradient</GButton
              >
            </GButtonGroup>
          </GField>
        </div>
        <div class="ew-stack">
          <GProgress
            aria-label="Animated progress sample"
            :percentage="debugPercentage"
            :tone="debugTone"
            :fill="debugFill"
            :change-animation="debugAnimation"
            :motion="{ durationMs: debugDuration, delayMs: 180 }"
            :show-percentage="true"
            label="Sample"
            :show-label="true"
          />
          <GProgress
            v-for="tone in progressTones"
            :key="tone"
            :aria-label="`${tone} progress sample`"
            :tone="tone"
            :percentage="debugPercentage"
          />
          <div v-for="size in progressSizes" :key="size">
            <GLabel>{{ size }} size</GLabel>
            <GProgress aria-label="Size sample" :size="size" :percentage="debugPercentage" />
          </div>
          <GProgress
            aria-label="Value and maximum sample"
            tone="shield"
            :value="753"
            :max="1200"
            :show-value="true"
            :show-percentage="true"
          />
          <GProgress aria-label="Slot sample" tone="energy" :percentage="debugPercentage">
            <template #leading><GIcon name="relic" /></template>
            <template #overlay="{ percentage }"
              ><strong>{{ percentage.toFixed(0) }}% complete</strong></template
            >
            <template #trailing><GBadge>sample</GBadge></template>
          </GProgress>
          <GProgress
            aria-label="Segmented energy sample"
            tone="energy"
            :percentage="debugPercentage"
            :segments="8"
          />
          <GProgress
            aria-label="Low opacity HUD sample"
            tone="mp"
            :percentage="debugPercentage"
            :track-opacity="0.38"
            :fill-opacity="0.82"
            :frame-opacity="0.72"
          />
          <GProgress
            aria-label="Reverse horizontal sample"
            tone="xp"
            :percentage="debugPercentage"
            :reverse="true"
          />
          <GProgress
            aria-label="Vertical sample"
            tone="shield"
            :percentage="debugPercentage"
            orientation="vertical"
            :reverse="true"
          />
          <GProgress aria-label="Indeterminate operation sample" tone="mp" :indeterminate="true" />
        </div>
        <div class="ew-progress-debug__diagnostics">
          <GLabel>Development diagnostics</GLabel>
          <GProgress aria-label="Clamped low sample" :percentage="-20" />
          <GProgress aria-label="Clamped high sample" :percentage="140" />
          <GProgress aria-label="Invalid range sample" :value="80" :min="100" :max="20" />
        </div>
      </GPanel>

      <GPanel>
        <div class="ew-panel__header">
          <h2 class="ew-heading">Gradient library</h2>
          <GBadge>50 presets</GBadge>
        </div>
        <GField>
          <GLabel>Gradient style</GLabel>
          <GSelect
            v-model="gradientVariant"
            :options="gradientVariants.map((variant) => ({ value: variant, label: variant }))"
          />
        </GField>
        <GGradient :variant="gradientVariant" />
      </GPanel>

      <section class="ew-split">
        <GPanel>
          <h2 class="ew-heading">Content and layout</h2>
          <GInset>
            <GText as="p">Interface text remains calm, readable, and contemporary.</GText>
            <GDivider />
            <p class="ew-caption">Caption and supporting metadata</p>
          </GInset>
        </GPanel>

        <GPanel>
          <h2 class="ew-heading">Actions</h2>
          <GButtonGroup>
            <GButton>Primary action</GButton>
            <GButton>Secondary</GButton>
            <GButton :loading="true">Loading</GButton>
          </GButtonGroup>
          <div style="margin-block-start: var(--ew-space-4)">
            <GChip>Selected tag</GChip>
          </div>
        </GPanel>
      </section>

      <GPanel>
        <div class="ew-panel__header">
          <h2 class="ew-heading">Button variants</h2>
          <GBadge>11 available</GBadge>
        </div>
        <div class="ew-button-group">
          <GButton variant="primary">Play</GButton>
          <GButton variant="secondary">Cancel</GButton>
          <GButton variant="ghost">Back</GButton>
          <GButton variant="danger">Delete</GButton>
          <GButton variant="success">Confirm</GButton>
          <GButton variant="warning">Review</GButton>
          <GButton variant="info">Details</GButton>
          <GButton variant="bronze">Equip</GButton>
          <GButton variant="dark">Close</GButton>
          <GButton variant="outline">Save</GButton>
          <GButton variant="link">Learn more</GButton>
          <GButton :loading="true">Saving</GButton>
          <GButton disabled>Unavailable</GButton>
        </div>
      </GPanel>

      <section class="ew-split">
        <GPanel>
          <h2 class="ew-heading">Forms</h2>
          <GField>
            <GLabel>Name</GLabel>
            <GInput model-value="Sample value" />
            <GFormHint>Visible helper text keeps field intent clear.</GFormHint>
          </GField>
          <GField>
            <GLabel>Biography</GLabel>
            <GTextArea model-value="Long-form text input" />
            <GFormError>Example validation message.</GFormError>
          </GField>
          <div class="ew-cluster">
            <GCheckbox :model-value="true">Checked</GCheckbox>
            <GSwitch :model-value="false">Switch</GSwitch>
          </div>
          <GSelect model-value="one">
            <option value="one">One</option>
            <option value="two">Two</option>
          </GSelect>
          <GNumberInput :model-value="42" />
          <GSlider :model-value="55" :min="0" :max="100" />
          <GRadioGroup>
            <GRadio name="example" value="a" :model-value="'a'">A</GRadio>
            <GRadio name="example" value="b" :model-value="'a'">B</GRadio>
          </GRadioGroup>
        </GPanel>

        <GPanel>
          <h2 class="ew-heading">Feedback</h2>
          <div class="ew-stack">
            <GAlert tone="info">Information is available.</GAlert>
            <GAlert tone="success">Changes saved successfully.</GAlert>
            <GAlert tone="danger">Review the highlighted field.</GAlert>
            <div class="ew-cluster">
              <GSpinner />
              <GEmptyState>Nothing to show yet.</GEmptyState>
            </div>
            <GErrorState>Something went wrong.</GErrorState>
          </div>
        </GPanel>
      </section>

      <section class="ew-split">
        <GPanel>
          <h2 class="ew-heading">Overlays</h2>
          <div class="ew-stack">
            <GTooltip>Tooltip text</GTooltip>
            <GPopover>Popover body</GPopover>
            <GModal>Modal body</GModal>
          </div>
        </GPanel>
        <GPanel>
          <h2 class="ew-heading">Support pieces</h2>
          <div class="ew-cluster">
            <GIcon name="relic" />
            <GBadge>badge</GBadge>
            <GStatus>status</GStatus>
          </div>
          <p class="ew-caption">
            The showcase is intentionally practical: it demonstrates real shared components rather
            than decorative filler.
          </p>
        </GPanel>
      </section>

      <GPanel>
        <div class="ew-panel__header">
          <h2 class="ew-heading">Component inventory</h2>
          <GBadge>development reference</GBadge>
        </div>
        <p class="ew-prose">
          Use the focused examples above to review released components without mounting controls
          outside their required contracts.
        </p>
      </GPanel>
    </div>
  </main>
</template>
