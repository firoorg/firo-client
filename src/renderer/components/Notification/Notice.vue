<template>
    <section class="notice">
        <slot />
    </section>
</template>

<script>
export default {
    name: 'Notice'
}
</script>

<style lang="scss" scoped>
    .notice {
        background: mix($color--polo-light, $color--white);
        padding: emRhythm(2);
        @include bleed-h(2);
        //@include box-shadow-large($color--polo-medium);
        @include glow-huge-box($color--polo-medium);

        font-style: italic;
        color: $color--comet;
        -webkit-font-smoothing: subpixel-antialiased;
    }
</style>
