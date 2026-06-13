<template>
  <div class="super-link link-fieldtype">
    <div class="!flex !flex-col !items-start !gap-4 sm:!flex-row">
      <div class="!w-full sm:!w-28">
        <Combobox
            v-model="option"
            :options="options"
            option-label="label"
            option-value="value"
            :clearable="false"
            :searchable="false"
        />
      </div>

      <div class="!shrink-1 !w-full !min-w-0 !flex-1 sm:!w-auto">
        <div>
          <Input
              v-if="option === 'url'"
              v-model="urlValue"
              placeholder="https://example.com"
          />

          <Input
              v-if="option === 'mailto'"
              v-model="mailtoValue"
              placeholder="email@example.com"
          />

          <Input
              v-if="option === 'tel'"
              v-model="telValue"
              placeholder="+1-555-123-4567"
          />

          <relationship-fieldtype
              v-if="option === 'entry'"
              ref="entries"
              handle="entry"
              :value="selectedEntries"
              :config="entryConfig"
              :meta="entryMeta"
              @update:value="entriesSelected"
              @update:meta="entryMetaUpdated"
          />

          <assets-fieldtype
              v-if="option === 'asset'"
              ref="assets"
              handle="asset"
              :value="selectedAssets"
              :config="assetConfig"
              :meta="assetMeta"
              @update:value="assetsSelected"
              @update:meta="assetMetaUpdated"
          />

          <div class="!mt-2 !flex !items-center" v-if="option !== null">
            <Switch :id="`target_blank-${uid}`" v-model="targetBlankValue"/>
            <label :for="`target_blank-${uid}`" class="ms-2 text-xs text-gray-700 dark:text-gray-200">
              Open link in new tab
            </label>
          </div>
        </div>
      </div>

      <div class="!w-full !shrink-0 sm:!w-1/3">
        <Input
            v-if="option !== null"
            v-model="textValue"
            placeholder="Enter Link Text"
        />
      </div>
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
</style>

<script setup>
import {computed, nextTick, provide, ref, watch} from 'vue';
import {Fieldtype} from '@statamic/cms';
import {Combobox, Input, Switch} from '@statamic/cms/ui';

const emit = defineEmits(Fieldtype.emits);
const props = defineProps(Fieldtype.props);
const {expose, update, updateDebounced, updateMeta} = Fieldtype.use(emit, props);

provide('isInLinkField', true);

defineExpose(expose);

const uid = `super-link-${Math.random().toString(36).slice(2)}`;

const metaChanging = ref(false);

const option = ref(props.meta?.initialOption ?? null);
const urlValue = ref(props.meta?.initialUrl ?? null);
const mailtoValue = ref(props.meta?.initialMailto ?? null);
const telValue = ref(props.meta?.initialTel ?? null);
const selectedEntries = ref(props.meta?.initialSelectedEntries ?? []);
const selectedAssets = ref(props.meta?.initialSelectedAssets ?? []);
const textValue = ref(props.meta?.initialText ?? null);
const targetBlankValue = ref(props.meta?.initialTargetBlank ?? false);

const entries = ref(null);
const assets = ref(null);

const meta = computed(() => props.meta ?? {});
const config = computed(() => props.config ?? {});
const entryConfig = computed(() => meta.value.entry?.config ?? {});
const assetConfig = computed(() => meta.value.asset?.config ?? {});
const entryMeta = ref(meta.value.entry?.meta ?? {});
const assetMeta = ref(meta.value.asset?.meta ?? {});

const buildMeta = (overrides) => {
  const next = {...meta.value, ...overrides};

  if (meta.value.entry) {
    next.entry = {...meta.value.entry, meta: entryMeta.value};
  }
  if (meta.value.asset) {
    next.asset = {...meta.value.asset, meta: assetMeta.value};
  }

  return next;
};

const options = computed(() => {
  return [
    config.value.required ? null : {label: __('None'), value: null},
    {label: __('URL'), value: 'url'},
    meta.value.showFirstChildOption
        ? {label: __('First Child'), value: 'first-child'}
        : null,
    {label: __('Entry'), value: 'entry'},
    meta.value.showAssetOption ? {label: __('Asset'), value: 'asset'} : null,
    {label: __('Email'), value: 'mailto'},
    {label: __('Phone'), value: 'tel'},
  ].filter(Boolean);
});

const linkValue = computed(() => {
  let url = null;

  if (option.value === 'url') {
    url = urlValue.value;
  } else if (option.value === 'mailto') {
    url = `mailto:${mailtoValue.value}`;
  } else if (option.value === 'tel') {
    url = `tel:${telValue.value}`;
  } else if (option.value === 'entry') {
    url = selectedEntries.value.length
        ? `entry::${selectedEntries.value[0]}`
        : null;
  } else if (option.value === 'asset') {
    url = selectedAssets.value.length
        ? `asset::${selectedAssets.value[0]}`
        : null;
  } else if (option.value === 'first-child') {
    url = '@child';
  }

  return {
    url,
    text: textValue.value,
    target_blank: targetBlankValue.value,
  };
});

watch(option, (newVal) => {
  if (metaChanging.value) return;

  if (newVal === null) {
    update(null);
  } else {
    updateDebounced(linkValue.value);

    if (newVal === 'entry' && !selectedEntries.value.length) {
      nextTick(() => entries.value?.linkExistingItem());
    }
    if (newVal === 'asset' && !selectedAssets.value.length) {
      nextTick(() => assets.value?.openSelector());
    }
  }

  updateMeta(buildMeta({initialOption: newVal}));
});

watch(urlValue, (newVal) => {
  if (metaChanging.value) return;
  updateDebounced(linkValue.value);
  updateMeta(buildMeta({initialUrl: newVal}));
});

watch(mailtoValue, (newVal) => {
  if (metaChanging.value) return;
  updateDebounced(linkValue.value);
  updateMeta(buildMeta({initialMailto: newVal}));
});

watch(telValue, (newVal) => {
  if (metaChanging.value) return;
  updateDebounced(linkValue.value);
  updateMeta(buildMeta({initialTel: newVal}));
});

watch(textValue, (newVal) => {
  if (metaChanging.value) return;
  update(linkValue.value);
  updateMeta(buildMeta({initialText: newVal}));
});

watch(targetBlankValue, (newVal) => {
  if (metaChanging.value) return;
  update(linkValue.value);
  updateMeta(buildMeta({initialTargetBlank: newVal}));
});

watch(selectedEntries, (newVal) => {
  if (metaChanging.value) return;
  update(linkValue.value);
  updateMeta(buildMeta({initialSelectedEntries: newVal}));
});

watch(selectedAssets, (newVal) => {
  if (metaChanging.value) return;
  update(linkValue.value);
  updateMeta(buildMeta({initialSelectedAssets: newVal}));
});

watch(
    () => props.meta,
    (newMeta, oldMeta) => {
      if (!newMeta || newMeta === oldMeta) return;

      metaChanging.value = true;

      option.value = newMeta.initialOption;
      urlValue.value = newMeta.initialUrl;
      mailtoValue.value = newMeta.initialMailto;
      telValue.value = newMeta.initialTel;
      textValue.value = newMeta.initialText;
      targetBlankValue.value = newMeta.initialTargetBlank;
      selectedEntries.value = newMeta.initialSelectedEntries;
      selectedAssets.value = newMeta.initialSelectedAssets;
      entryMeta.value = newMeta.entry?.meta ?? {};
      assetMeta.value = newMeta.asset?.meta ?? {};

      nextTick(() => {
        metaChanging.value = false;
      });
    },
    {deep: true}
);

const entryMetaUpdated = (newMeta) => {
  entryMeta.value = newMeta;
  updateMeta(
      buildMeta({
        entry: {
          ...(meta.value.entry ?? {}),
          meta: newMeta,
        },
      })
  );
};

const assetMetaUpdated = (newMeta) => {
  assetMeta.value = newMeta;
  updateMeta(
      buildMeta({
        asset: {
          ...(meta.value.asset ?? {}),
          meta: newMeta,
        },
      })
  );
};

const entriesSelected = (entriesList) => {
  selectedEntries.value = entriesList;
};

const assetsSelected = (assetsList) => {
  selectedAssets.value = assetsList;
};
</script>
