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
        background: $gradient--comet-dark-horizontal;
        padding: emRhythm(0.25) emRhythm(0.35);
        display: inline-block;
        color: $color--white;
        border-radius: emRhythm(0.5);
        text-align: center;

        position: absolute;
        right: -75%;
        bottom: -18%;

        pointer-events: none;
    }
</style>
