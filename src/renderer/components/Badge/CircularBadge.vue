<template>
    <div :class="[color, radiusClass]">
        {{ content }}
    </div>
</template>

<script>
export default {
    name: 'CircularBadge',

    props: {
        color: {
            type: String,
            default: ''
        },

        content: {
            type: [String, Number],
            required: true
        }
    },

    computed: {
        radiusClass () {
            return ('' + this.content).length > 1 ? 'edges' : 'full'
        }
    }
}
</script>

<style lang="scss" scoped>
div {
    display: inline-block;
    min-width: emRhythm(2.5);
    transition: color .25s ease-in-out, background .25s ease-in-out;
    text-align: center;

    background: $color--comet-dark;
    color: $color--white-light;
    border-radius: 1.25rem;
    padding: 0 0.25rem;
    box-sizing: border-box;

    &.full {
        border-radius: 1.25rem;
    }

    &.edges {
        padding: 0 0.5rem;
        border-radius: 0.625rem;
    }

    &.private,
    &.green {
        background: $gradient--green-bright;
        color: $color--dark;
    }

    &.public,
    &.orange {
        background: $gradient--orange-vertical;
        color: $color--dark;
    }

    &.error,
    &.red {
        background: $gradient--red-vertical;
        color: $color--white;
    }
}
</style>
