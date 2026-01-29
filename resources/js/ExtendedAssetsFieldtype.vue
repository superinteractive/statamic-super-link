<script>
const AssetsFieldtype = Statamic.$components.get('assets-fieldtype');

export default {
  extends: AssetsFieldtype,

  computed: {
    isInLinkField() {
      return true;
    },
    showSetAlt() {
      return false;
    },
  },
};
</script>
