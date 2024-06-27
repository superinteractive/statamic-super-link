import SuperLink from './SuperLink.vue';

Statamic.booting(() => {
    Statamic.$components.register('super_link-fieldtype', SuperLink);
});
