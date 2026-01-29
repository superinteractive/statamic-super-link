import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import inject from '@rollup/plugin-inject';
import statamic from '@statamic/cms/vite-plugin';

export default defineConfig({
    plugins: [
        statamic(),
        laravel({
            input: [
                'resources/js/cp.js',
                'resources/css/cp.css',
            ],
            refresh: true,
            publicDirectory: 'resources/dist',
            hotFile: 'resources/dist/hot',
        }),
        inject({
            _: 'underscore',
            include: 'resources/js/**',
        }),
    ],
});
