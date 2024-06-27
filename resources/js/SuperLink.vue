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
                :reduce="option => option.value"
            >
                <template #option="{ label }">
                    {{ __(label) }}
                </template>
            </v-select>
        </div>

        <div class="!shrink-1 !w-full !min-w-0 !flex-1 sm:!w-auto">
            <div>
                <!-- URL text input -->
                <text-input v-if="option === 'url'" v-model="urlValue" placeholder="https://example.com" />

                <!-- Mailto text input -->
                <text-input v-if="option === 'mailto'" v-model="mailtoValue" placeholder="email@example.com" />

                <!-- Tel text input -->
                <text-input v-if="option === 'tel'" v-model="telValue" placeholder="+1-555-123-4567" />

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

                <div class="!mt-2 !flex !items-center" tabindex="-1" v-if="option !== null">
                    <!-- Checkbox for 'Open link in new tab' -->
                    <input type="checkbox" :id="`target_blank-${_uid}`" v-model="targetBlankValue" tabindex="-1" />
                    <label :for="`target_blank-${_uid}`" class="ml-2 text-xs" taxindex="-1">Open link in new tab</label>
                </div>
            </div>
        </div>

        <!-- Your custom link text field -->
        <div class="!w-full !shrink-0 sm:!w-1/3">
            <text-input v-if="option !== null" v-model="textValue" placeholder="Enter Link Text" />
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

    export default {
        mixins: [Fieldtype, PositionsSelectOptions],

        components: {
            ExtendedAssetsFieldtype,
            // any other components you are using
        },

        data() {
            return {
                option: this.meta.initialOption,
                options: this.initialOptions(),
                urlValue: this.meta.initialUrl,
                mailtoValue: this.meta.initialMailto,
                telValue: this.meta.initialTel,
                selectedEntries: this.meta.initialSelectedEntries,
                selectedAssets: this.meta.initialSelectedAssets,
                metaChanging: false,
                textValue: this.meta.initialText,
                targetBlankValue: this.meta.initialTargetBlank,
            };
        },

        computed: {
            entryValue() {
                return this.selectedEntries.length ? `entry::${this.selectedEntries[0]}` : null;
            },

            assetValue() {
                return this.selectedAssets.length ? `asset::${this.selectedAssets[0]}` : null;
            },

            linkValue() {
                // Construct the composite object to include both link and text
                let urlValue = null;

                if (this.option === 'url') {
                    urlValue = this.urlValue;
                } else if (this.option === 'mailto') {
                    urlValue = 'mailto:' + this.mailtoValue;
                } else if (this.option === 'tel') {
                    urlValue = 'tel:' + this.telValue;
                } else if (this.option === 'entry') {
                    urlValue = this.entryValue;
                } else if (this.option === 'asset') {
                    urlValue = this.assetValue;
                } else if (this.option === 'first-child') {
                    urlValue = '@child';
                }

                return {
                    url: urlValue,
                    text: this.textValue,
                    target_blank: this.targetBlankValue,
                };
            },
        },

        watch: {
            option(option, oldOption) {
                if (this.metaChanging) return;

                if (option === null) {
                    this.update(null);
                } else if (option === 'url') {
                    this.updateDebounced(this.urlValue);
                } else if (option === 'mailto') {
                    this.updateDebounced(this.mailtoValue);
                } else if (option === 'tel') {
                    this.updateDebounced(this.telValue);
                } else if (option === 'first-child') {
                    this.update('@child');
                } else if (option === 'entry') {
                    if (this.entryValue) {
                        this.update(this.entryValue);
                    } else {
                        setTimeout(() => this.$refs.entries.linkExistingItem(), 0);
                    }
                } else if (option === 'asset') {
                    if (this.assetValue) {
                        this.update(this.assetValue);
                    } else {
                        setTimeout(() => this.$refs.assets.openSelector(), 0);
                    }
                }
            },

            textValue(textValue) {
                if (this.metaChanging) return;

                this.update(textValue);
            },

            urlValue(url) {
                if (this.metaChanging) return;

                this.update(url);
            },

            mailtoValue(mailto) {
                if (this.metaChanging) return;

                this.update(mailto);
            },

            telValue(tel) {
                if (this.metaChanging) return;

                this.update(tel);
            },

            targetBlankValue(targetBlankValue) {
                if (this.metaChanging) return;

                this.update(targetBlankValue);
            },

            meta(meta) {
                this.metaChanging = true;
                this.urlValue = meta.initialUrl;
                this.mailtoValue = meta.initialMailto;
                this.telValue = meta.initialTel;
                this.textValue = meta.initialText;
                this.targetBlankValue = meta.initialTargetBlank;
                this.option = meta.initialOption;
                this.selectedEntries = meta.initialSelectedEntries;
                this.selectedAssets = meta.initialSelectedAssets;
                this.$nextTick(() => (this.metaChanging = false));
            },

            // Watch the composite linkValue for changes
            linkValue(newValue) {
                if (this.metaChanging) return;

                // Update the entire composite value
                this.update(newValue);
            },
        },

        methods: {
            initialOptions() {
                return [
                    this.config.required ? null : { label: __('None'), value: null },

                    { label: __('URL'), value: 'url' },

                    this.meta.showFirstChildOption ? { label: __('First Child'), value: 'first-child' } : null,

                    { label: __('Entry'), value: 'entry' },

                    this.meta.showAssetOption ? { label: __('Asset'), value: 'asset' } : null,

                    { label: __('Email'), value: 'mailto' },

                    { label: __('Phone'), value: 'tel' },
                ].filter(option => option);
            },

            entriesSelected(entries) {
                this.selectedEntries = entries;
                this.update(this.entryValue);
            },

            assetsSelected(assets) {
                this.selectedAssets = assets;
                this.update(this.assetValue);
            },
        },
    };
</script>
