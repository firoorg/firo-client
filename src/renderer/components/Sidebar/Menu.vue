<template>
    <section class="menu">

    </section>
</template>

<script>
  import AttentionBadge from '@/components/Badge/AttentionBadge'

  export default {
      name: 'Menu',
      components: {
          AttentionBadge
      }
  }
</script>

<style lang="scss" scoped>
    .menu .menubar {
        //margin-top: emRhythm(0.41);
        //@include sassline(zeta, $bodytype, 2, 2, all);
        border: none;
        padding-left: emRhythm(3);
        padding-right: emRhythm(3);
        text-align: left;
    }
    .el-menu-item {
        //@include fontsize(12, full);
        margin: 0 0 emRhythm(1);
        border-radius: 0.25rem;
    }
</style>