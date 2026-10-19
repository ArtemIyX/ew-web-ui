<script lang="ts" src="./MenuCreateCharacterView.ts"></script>
<template>
  <section
    class="menu-create menu-content"
    :aria-busy="store.createStatus === CharacterCreateStatus.Creating"
  >
    <h1 class="ew-sr-only">{{ title }}</h1>
    <p v-if="store.catalogueStatus === CharacterCatalogueStatus.Loading" aria-live="polite">
      {{ creating }}
    </p>
    <div v-else-if="store.catalogue" class="character-creation-stage">
      <section class="character-race-picker">
        <fieldset class="character-race-tabs">
          <legend class="ew-sr-only">{{ raceLabel }}</legend>
          <button
            v-for="(race, index) in store.catalogue.races"
            :key="race.id"
            type="button"
            :aria-label="raceNames[index]"
            :title="raceNames[index]"
            :class="{ selected: store.selectedRaceId === race.id }"
            :aria-pressed="store.selectedRaceId === race.id"
            @click="store.selectRace(race.id)"
          >
            <GIcon :source="race.icon" aria-hidden="true" /><span>{{ raceNames[index] }}</span>
          </button>
        </fieldset>
      </section>
      <section
        class="character-race-details character-details"
        aria-labelledby="selected-race-label"
      >
        <h2 id="selected-race-label">{{ selectedRaceName }}</h2>
        <p>{{ selectedRaceDescription }}</p>
      </section>
      <section class="character-selection" :aria-label="`${genderLabel} and ${classLabel}`">
        <fieldset>
          <legend>{{ genderLabel }}</legend>
          <div class="character-options">
            <button
              v-for="(gender, index) in store.catalogue.genders"
              :key="gender.id"
              type="button"
              :aria-pressed="store.selectedGenderId === gender.id"
              :class="{ selected: store.selectedGenderId === gender.id }"
              @click="store.selectedGenderId = gender.id"
            >
              {{ genderNames[index] }}
            </button>
          </div>
        </fieldset>
        <fieldset>
          <legend>{{ classLabel }}</legend>
          <div class="character-options">
            <GTooltip
              v-for="(item, index) in store.availableClasses"
              :key="`tooltip-${item.id}`"
              class="character-class-tooltip"
            >
              <template #trigger="{ triggerProps }">
                <button
                  v-bind="triggerProps"
                  :key="item.id"
                  type="button"
                  :aria-label="classNames[index]"
                  :aria-pressed="store.selectedClassId === item.id"
                  :class="{ selected: store.selectedClassId === item.id }"
                  @click="store.selectedClassId = item.id"
                >
                  <GIcon :source="item.icon" aria-hidden="true" />
                  <span class="ew-sr-only">{{ classNames[index] }}</span>
                </button>
              </template>
              <span class="ew-tooltip__title">{{ classNames[index] }}</span>
              <p class="ew-tooltip__description">{{ classDescriptions[index] }}</p>
            </GTooltip>
            <p v-if="!store.availableClasses.length">{{ noClasses }}</p>
          </div>
        </fieldset>
        <div class="character-details character-class-details" aria-live="polite">
          <h2>{{ selectedClassName }}</h2>
          <p>{{ selectedClassDescription }}</p>
        </div>
      </section>
    </div>
    <form v-if="store.catalogue" class="char-create" @submit.prevent="submit">
      <label for="character-name">{{ nameLabel }}</label
      ><input
        id="character-name"
        v-model="store.characterName"
        :placeholder="placeholder"
        :disabled="store.createStatus === CharacterCreateStatus.Creating"
        required
      />
      <div class="character-actions">
        <button class="ew-button ew-button--primary" type="submit" :disabled="!store.canCreate">
          {{
            store.createStatus === CharacterCreateStatus.Creating ? creating : createLabel
          }}</button
        ><button
          class="ew-button ew-button--secondary"
          type="button"
          :disabled="store.createStatus === CharacterCreateStatus.Creating"
          @click="backToHeroes"
        >
          {{ back }}
        </button>
      </div>
    </form>
    <p v-if="store.errorKey" class="menu-error character-creation-error" role="alert">
      {{ error }}
    </p>
  </section>
</template>
