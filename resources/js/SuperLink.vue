<template>
  <div class="super-link !flex !flex-col !items-start !gap-4 sm:!flex-row">
    <!-- Link type selector -->
    <div class="!w-full sm:!w-28">
      <v-select
          v-model="option"
          append-to-body
          :calculate-position="positionOptions"
          :options="options"
          :clearable="false"
          :reduce="(o) => o.value"
      >
        <template #option="{ label }">
          {{ __(label) }}
        </template>
      </v-select>
    </div>

    <div class="!shrink-1 !w-full !min-w-0 !flex-1 sm:!w-auto">
      <div>
        <!-- URL text input -->
        <text-input
            v-if="option === 'url'"
            v-model="urlValue"
            placeholder="https://example.com"
        />

        <!-- Mailto text input -->
        <text-input
            v-if="option === 'mailto'"
            v-model="mailtoValue"
            placeholder="email@example.com"
        />

        <!-- Tel text input -->
        <text-input
            v-if="option === 'tel'"
            v-model="telValue"
            placeholder="+1-555-123-4567"
        />

        <!-- Entry select -->
        <relationship-fieldtype
            v-if="option === 'entry'"
            ref="entries"
            handle="entry"
            :value="selectedEntries"
            :config="meta.entry.config"
            :meta="meta.entry.meta"
            @input="entriesSelected"
            @meta-updated="meta.entry.meta = $event"
            class="sm:-mt-0.5"
        />

        <!-- Asset select -->
        <extended-assets-fieldtype
            v-if="option === 'asset'"
            ref="assets"
            handle="asset"
            :value="selectedAssets"
            :config="meta.asset.config"
            :meta="meta.asset.meta"
            @input="assetsSelected"
            @meta-updated="meta.asset.meta = $event"
        />

        <div class="!mt-2 !flex !items-center" v-if="option !== null">
          <!-- "Open link in new tab" checkbox -->
          <input
              type="checkbox"
              :id="`target_blank-${_uid}`"
              v-model="targetBlankValue"
          />
          <label :for="`target_blank-${_uid}`" class="ml-2 text-xs">
            Open link in new tab
          </label>
        </div>
      </div>
    </div>

    <!-- Link text field -->
    <div class="!w-full !shrink-0 sm:!w-1/3">
      <text-input
          v-if="option !== null"
          v-model="textValue"
          placeholder="Enter Link Text"
      />
    </div>
  </div>
</template>

<style>
.super-link .relationship-input-empty {
  @apply flex min-h-10 items-center;
}
.super-link .relationship-input-empty svg {
  @apply shrink-0;
}
.super-link .relationship-input-empty .relationship-input-buttons {
  @apply flex min-h-10 w-full items-center;
}
.super-link .relationship-input-buttons button {
  @apply mb-0;
}
.super-link .relationship-input-buttons button > * {
  @apply shrink-0;
}
.super-link .asset-table-listing {
  @apply sm:-mt-1;
}
</style>

<script>
import PositionsSelectOptions from '../../vendor/statamic/cms/resources/js/mixins/PositionsSelectOptions';
import ExtendedAssetsFieldtype from './ExtendedAssetsFieldtype.vue';

/**
 * This component follows the same "update meta on each local change" approach
 * as Statamic's built-in Link field. The difference is:
 *   - we call `this.update(...)` with an OBJECT { url, text, target_blank }
 *     instead of a single string.
 *
 * That way, your final saved data is an object, not just a URL string.
 */
export default {
  mixins: [Fieldtype, PositionsSelectOptions],

  components: {
    ExtendedAssetsFieldtype,
  },

  data() {
    return {
      // Starting from meta (like the core Link field)
      option: this.meta.initialOption,
      urlValue: this.meta.initialUrl,
      mailtoValue: this.meta.initialMailto,
      telValue: this.meta.initialTel,
      selectedEntries: this.meta.initialSelectedEntries,
      selectedAssets: this.meta.initialSelectedAssets,
      textValue: this.meta.initialText,
      targetBlankValue: this.meta.initialTargetBlank,

      metaChanging: false,

      options: this.initialOptions(),
    };
  },

  computed: {
    /**
     * A single "composite" object with { url, text, target_blank }.
     * We'll pass this to `this.update(...)`.
     */
    linkValue() {
      let url = null;

      if (this.option === 'url') {
        url = this.urlValue;
      } else if (this.option === 'mailto') {
        url = 'mailto:' + this.mailtoValue;
      } else if (this.option === 'tel') {
        url = 'tel:' + this.telValue;
      } else if (this.option === 'entry') {
        url = this.selectedEntries.length
            ? `entry::${this.selectedEntries[0]}`
            : null;
      } else if (this.option === 'asset') {
        url = this.selectedAssets.length
            ? `asset::${this.selectedAssets[0]}`
            : null;
      } else if (this.option === 'first-child') {
        url = '@child';
      }

      return {
        url,
        text: this.textValue,
        target_blank: this.targetBlankValue,
      };
    },
  },

  watch: {
    /**
     * 1) Watch changes to "option" and update the store as an OBJECT.
     *    Also mirror them to meta (so that unsaved changes persist
     *    if a Replicator refresh re-initializes this field).
     */
    option(newVal, oldVal) {
      if (this.metaChanging) return;

      if (newVal === null) {
        this.update(null);
      } else {
        // For typed fields, we do a "debounced" approach so we don't
        // update the store on every keystroke. If you prefer immediate,
        // you can do `this.update(this.linkValue)` instead.
        this.updateDebounced(this.linkValue);

        // Auto-open pickers if switching to entry/asset with none selected
        if (newVal === 'entry' && !this.selectedEntries.length) {
          this.$nextTick(() => this.$refs.entries.linkExistingItem());
        }
        if (newVal === 'asset' && !this.selectedAssets.length) {
          this.$nextTick(() => this.$refs.assets.openSelector());
        }
      }

      // Mirror the new selected "option" back to meta
      this.updateMeta({ ...this.meta, initialOption: newVal });
    },

    /**
     * 2) Watch each local property and update:
     *    - the store with the FULL object
     *    - the meta with the new "initial" value
     */
    urlValue(newVal) {
      if (this.metaChanging) return;
      this.updateDebounced(this.linkValue);
      this.updateMeta({ ...this.meta, initialUrl: newVal });
    },
    mailtoValue(newVal) {
      if (this.metaChanging) return;
      this.updateDebounced(this.linkValue);
      this.updateMeta({ ...this.meta, initialMailto: newVal });
    },
    telValue(newVal) {
      if (this.metaChanging) return;
      this.updateDebounced(this.linkValue);
      this.updateMeta({ ...this.meta, initialTel: newVal });
    },
    textValue(newVal) {
      if (this.metaChanging) return;
      // If you like, you could do "debounced" for text as well:
      this.update(this.linkValue);
      this.updateMeta({ ...this.meta, initialText: newVal });
    },
    targetBlankValue(newVal) {
      if (this.metaChanging) return;
      this.update(this.linkValue);
      this.updateMeta({ ...this.meta, initialTargetBlank: newVal });
    },

    /**
     * 3) Whenever selected entries/assets changes, do the same approach.
     */
    selectedEntries(newVal) {
      if (this.metaChanging) return;
      this.update(this.linkValue);
      this.updateMeta({ ...this.meta, initialSelectedEntries: newVal });
    },
    selectedAssets(newVal) {
      if (this.metaChanging) return;
      this.update(this.linkValue);
      this.updateMeta({ ...this.meta, initialSelectedAssets: newVal });
    },

    /**
     * 4) If the meta changes from outside (e.g. a blueprint refresh in
     *    a nested Replicator), set `metaChanging=true`, reinitialize from meta,
     *    then turn off the flag.
     */
    meta: {
      deep: true,
      handler(newMeta, oldMeta) {
        if (JSON.stringify(newMeta) === JSON.stringify(oldMeta)) return;

        this.metaChanging = true;

        // Re-initialize local data from meta
        this.option = newMeta.initialOption;
        this.urlValue = newMeta.initialUrl;
        this.mailtoValue = newMeta.initialMailto;
        this.telValue = newMeta.initialTel;
        this.textValue = newMeta.initialText;
        this.targetBlankValue = newMeta.initialTargetBlank;
        this.selectedEntries = newMeta.initialSelectedEntries;
        this.selectedAssets = newMeta.initialSelectedAssets;

        this.$nextTick(() => (this.metaChanging = false));
      },
    },
  },

  methods: {
    initialOptions() {
      return [
        this.config.required ? null : { label: __('None'), value: null },
        { label: __('URL'), value: 'url' },
        this.meta.showFirstChildOption
            ? { label: __('First Child'), value: 'first-child' }
            : null,
        { label: __('Entry'), value: 'entry' },
        this.meta.showAssetOption
            ? { label: __('Asset'), value: 'asset' }
            : null,
        // If you want mailto/tel in the dropdown, include them:
        { label: __('Email'), value: 'mailto' },
        { label: __('Phone'), value: 'tel' },
      ].filter(Boolean);
    },

    /**
     * Called by <relationship-fieldtype> whenever user picks entries.
     */
    entriesSelected(entries) {
      this.selectedEntries = entries;
    },

    /**
     * Called by <extended-assets-fieldtype> whenever user picks assets.
     */
    assetsSelected(assets) {
      this.selectedAssets = assets;
    },
  },
};
</script>
