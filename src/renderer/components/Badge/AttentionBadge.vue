<template>
    <div class="badge attention">
        {{ amount }}
    </div>
</template>

<script>
  export default {
      name: 'AttentionBadge',
      props: {
          amount: Number
      }
  }
</script>

<style lang="scss">
    .badge.attention {
        color: $color--dark;
        background-color: transparent;
        background: $gradient--green-bright;
        vertical-align: text-top;
        @include font-black()
    }
</style>