import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue2';
import inject from '@rollup/plugin-inject';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/cp.js', 'resources/css/cp.css'],
            publicDirectory: 'dist',
        }),
        // vue2(),
        // {
        //     name: 'fix-my-imports',
        //     transform(code, id) {
        //         if (id.endsWith('Uploader.vue')) {
        //             return code.replace("import { Upload } from 'upload';", "import Upload from './Upload.vue';");
        //         }
        //     },
        // },
        vue(),
        inject({
            Vue: 'vue',
            _: 'underscore',
            include: 'resources/js/**',
        }),
    ],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm.js',
        },
    },
});
