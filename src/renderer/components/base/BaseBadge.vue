<template>
    <span class="badge-wrap">
        <slot />
        <span
            v-show="visible"
            class="badge"
        >
            {{ count }}
        </span>
    </span>
</template>

<script>
export default {
    name: 'BaseBadge',

    props: {
        visible: {
            type: Boolean,
            default: true
        },
        count: {
            type: Number,
            default: 0
        }
    }
}
</script>

<style lang="scss" scoped>
    .badge-wrap {
        position: relative;
    }

    .badge {
        @include setType(2, $ms-down1);
        background: $gradient--comet-dark-horizontal;
        padding: emRhythm(0.25, $silent: true) emRhythm(0.75, $silent: true) emRhythm(0.35, $silent: true);
        display: inline-block;
        color: $color--white;
        @include font-heavy();
        border-radius: emRhythm(0.5, $silent: true);
        text-align: center;

        position: absolute;
        right: -75%;
        bottom: -18%;

        pointer-events: none;
    }
</style>