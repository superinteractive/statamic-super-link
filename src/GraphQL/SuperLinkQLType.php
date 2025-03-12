<?php

namespace SuperInteractive\SuperLink\GraphQL;

use Rebing\GraphQL\Support\Type as GraphQLType;
use GraphQL\Type\Definition\Type;

class SuperLinkQLType extends GraphQLType
{
    protected $attributes = [
        'name'        => 'SuperLink',
        'description' => 'A structured link object (URL, text, target).'
    ];

    public function fields(): array
    {
        return [
            'url' => [
                'type'        => Type::string(),
                'description' => 'The link URL',
            ],
            'text' => [
                'type'        => Type::string(),
                'description' => 'The link text',
            ],
            'target' => [
                'type'        => Type::string(),
                'description' => 'The target, e.g. _blank or _self',
            ],
        ];
    }
}
