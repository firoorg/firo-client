<template>
    <div
        class="notification-indicator"
        :class="{ shadow: hasShadow }"
    />
</template>

<script>
export default {
    name: 'NotificationIndicator',
    props: {
        hasShadow: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style lang="scss" scoped>
    .notification-indicator {
        display: inline-block;
        width: emRhythm(1);
        height: emRhythm(1);
        border-radius: 50%;
        background: $gradient--green-bright;
        //position: absolute;
        //right: 0;
        //top: 0;
        text-align: right;

        &.shadow {
            @include box-shadow();
        }
    }
</style>