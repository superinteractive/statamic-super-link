<?php

namespace SuperInteractive\SuperLink;

use Statamic\Providers\AddonServiceProvider;
use SuperInteractive\SuperLink\Fieldtypes\SuperLinkFieldtype;

class ServiceProvider extends AddonServiceProvider
{
    protected $vite = [
        'input' => [
            'resources/js/cp.js',
            'resources/css/cp.css'
        ],
        'publicDirectory' => 'dist',
    ];

    protected $fieldtypes = [
        SuperLinkFieldtype::class,
    ];

    public function bootAddon()
    {
    }
}
