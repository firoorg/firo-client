<template>
    <section class="settings">
        Anonymize Connection
    </section>
</template>

<script>
  import { addVuexModel } from '@/utils/store'

  export default {
      name: 'Settings',
      computed: {
          ...addVuexModel({
              name: 'connectViaTor',
              namespace: 'AnonymitySettings',
              getter: 'isConnectedViaTor',
              action: 'updateConnectionViaTor'
          })
      }
  }
</script>

<style lang="scss" scoped>

</style>