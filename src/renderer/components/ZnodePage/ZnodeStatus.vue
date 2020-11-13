<template>
    <span
        class="status-badge"
        :class="status"
    >
        {{ status }}
    </span>
</template>

<script>
export default {
    name: 'ZnodeStatus',

    props: {
        status: {
            type: String,
            default: 'UNLISTED'
        }
    }
}
</script>

<style lang="scss" scoped>
    .status-badge {
        display: inline-block;
        border-radius: emRhythm(0.5);
        padding: 0.125rem 0.25rem;
        margin: -0.125rem 0;
        background: $color--green;
        color: $color--polo-light;

        &.ENABLED {
        }

        &.PRE_ENABLED, &.MISSING {
            background: rgba($color--green, 0.5);
        }

        &.EXPIRED, &.OUTPUT_SPENT, &.UPDATE_REQUIRED, &.WATCHDOG_EXPIRED, &.NEW_START_REQUIRED, &.POSE_BAN {
            background: $color--red;
        }
    }
</style>
