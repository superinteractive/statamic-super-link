<?php

namespace SuperInteractive\SuperLink;

use Statamic\Providers\AddonServiceProvider;
use SuperInteractive\SuperLink\Fieldtypes\SuperLinkFieldtype;
use Statamic\Facades\GraphQL;
use SuperInteractive\SuperLink\GraphQL\SuperLinkQLType;

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
        parent::bootAddon();

        // Register your custom type with Statamic’s GraphQL
        GraphQL::addType(SuperLinkQLType::class);
    }
}
