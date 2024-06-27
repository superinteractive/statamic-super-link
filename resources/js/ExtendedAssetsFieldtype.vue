<script>
    import AssetsFieldType from '../../vendor/statamic/cms/resources/js/components/fieldtypes/assets/AssetsFieldtype.vue';

    export default {
        extends: AssetsFieldType,

        computed: {
            isInLinkField() {
                // Your custom logic here
                return true; // or whatever you need it to be
            },
            showSetAlt() {
                return false;
            },
        },
    };
</script>
