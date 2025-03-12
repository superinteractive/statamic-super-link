<?php

namespace SuperInteractive\SuperLink\Fieldtypes;

use Facades\Statamic\Routing\ResolveRedirect;
use Statamic\Contracts\Entries\Collection;
use Statamic\Contracts\Entries\Entry;
use Statamic\Facades;
use Statamic\Facades\Blink;
use Statamic\Facades\GraphQL;
use Statamic\Facades\Site;
use Statamic\Fields\Field;
use Statamic\Fields\Fieldtype;
use Statamic\Fieldtypes\Link\ArrayableLink;
use Statamic\Support\Str;

class SuperLinkFieldtype extends Fieldtype
{
    protected $icon = 'external-link';

    protected $categories = ['relationship'];

    protected function configFieldItems(): array
    {
        return [
            [
                'display' => __('Behavior'),
                'fields' => [
                    'collections' => [
                        'display' => __('Collections'),
                        'instructions' => __('statamic::fieldtypes.link.config.collections'),
                        'type' => 'collections',
                        'mode' => 'select',
                    ],
                    'container' => [
                        'display' => __('Container'),
                        'instructions' => __('statamic::fieldtypes.link.config.container'),
                        'type' => 'asset_container',
                        'mode' => 'select',
                        'max_items' => 1,
                    ],
                ],
            ],
        ];
    }

    public function augment($value): null|array|ArrayableLink
    {
        if (is_null($url = $value['url'] ?? null)) {
            return null;
        }

        if (Str::startsWith($url, 'mailto:')) {
            return [
                'url' => $url,
                'text' => $value['text'] ?? null,
                'target_blank' => $value['target_blank'] ?? false,
            ];
        }

        if (Str::startsWith($url, 'tel:')) {
            return [
                'url' => $url,
                'text' => $value['text'] ?? null,
                'target_blank' => $value['target_blank'] ?? false,
            ];
        }

        $resolvedUrl = is_object($augmentedUrl = ResolveRedirect::item($url, $this->field->parent(), true))
            ? $augmentedUrl->url()
            : $url;

        return [
            'url' => $resolvedUrl,
            'text' => $value['text'] ?? null,
            'target' => isset($value['target_blank']) && $value['target_blank'] === true ? '_blank' : '_self',
        ];
    }

    public function preload()
    {
        $value = $this->field->value();

        // Check if 'url' and 'text' keys exist and are not null
        $url = $value['url'] ?? null;
        $text = $value['text'] ?? null;

        $showAssetOption = $this->showAssetOption();

        $selectedEntry = $url && Str::startsWith($url, 'entry::') ? Str::after($url, 'entry::') : null;
        $selectedAsset = $url && Str::startsWith($url, 'asset::') ? Str::after($url, 'asset::') : null;
        $mailto = $url && Str::startsWith($url, 'mailto:') ? Str::after($url, 'mailto:') : null;
        $tel = $url && Str::startsWith($url, 'tel:') ? Str::after($url, 'tel:') : null;
        $url = ($url !== '@child' && !$selectedEntry && !$selectedAsset && !$mailto && !$tel) ? $url : null;

        $entryFieldtype = $this->nestedEntriesFieldtype($selectedEntry);
        $assetFieldtype = $showAssetOption ? $this->nestedAssetsFieldtype($selectedAsset) : null;
        $targetBlank = $value['target_blank'] ?? false;

        return [
            'initialUrl' => $url,
            'initialMailto' => $mailto,
            'initialTel' => $tel,
            'initialText' => $text,
            'initialSelectedEntries' => $selectedEntry ? [$selectedEntry] : [],
            'initialSelectedAssets' => $selectedAsset ? [$selectedAsset] : [],
            'initialOption' => $this->initialOption($value, $selectedEntry, $selectedAsset, $mailto, $tel),
            'showFirstChildOption' => $this->showFirstChildOption(),
            'showAssetOption' => $showAssetOption,
            'entry' => [
                'config' => $entryFieldtype->config(),
                'meta' => $entryFieldtype->preload(),
            ],
            'asset' => $showAssetOption ? [
                'config' => $assetFieldtype->config(),
                'meta' => $assetFieldtype->preload(),
            ] : null,
            'initialTargetBlank' => $targetBlank,
        ];
    }

    private function initialOption($value, $entry, $asset, $mailto = null, $tel = null)
    {
        if (!$value) {
            return $this->field->isRequired() ? 'url' : null;
        }

        if ($value['url'] === '@child') {
            return 'first-child';
        } elseif ($entry) {
            return 'entry';
        } elseif ($asset) {
            return 'asset';
        } elseif ($mailto) {
            return 'mailto';
        } elseif ($tel) {
            return 'tel';
        }

        return 'url';
    }

    private function nestedEntriesFieldtype($value): Fieldtype
    {
        $entryField = (new Field('entry', [
            'type' => 'entries',
            'max_items' => 1,
            'create' => false,
        ]));

        $entryField->setValue($value);

        $entryField->setConfig(array_merge(
            $entryField->config(),
            ['collections' => $this->collections()]
        ));

        return $entryField->fieldtype();
    }

    private function nestedAssetsFieldtype($value): Fieldtype
    {
        $assetField = (new Field('entry', [
            'type' => 'assets',
            'max_files' => 1,
            'mode' => 'list',
        ]));

        $assetField->setValue($value);

        $assetField->setConfig(array_merge(
            $assetField->config(),
            ['container' => $this->config('container')]
        ));

        return $assetField->fieldtype();
    }

    private function collections()
    {
        return $this->config('collections') ?? Blink::once('routable-collection-handles', function () {
            $site = Site::current()->handle();

            return Facades\Collection::all()->reject(fn($collection) => is_null($collection->route($site)))->map->handle()->values()->all();
        });
    }

    private function showFirstChildOption(): bool
    {
        $parent = $this->field()->parent();
        $collection = $parent instanceof Entry ? $parent->collection() : ($parent instanceof Collection ? $parent : null);

        return $collection?->hasStructure() && $collection->structure()->maxDepth() !== 1 ?? false;
    }

    private function showAssetOption(): bool
    {
        return $this->config('container') !== null;
    }

    public function toGqlType()
    {
        return GraphQL::type('SuperLink');
    }
}
