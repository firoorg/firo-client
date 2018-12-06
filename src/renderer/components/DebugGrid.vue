<template>
    <div
        class="debug-grid"
        :class="{ active: isVisible }"
    >
        <form>
            <input
                v-model="isVisible"
                type="checkbox"
            >
        </form>
        <div class="grid va-debug" />
    </div>
</template>

<script>
export default {
    name: 'DebugGrid',
    data () {
        return {
            isVisible: false
        }
    }
}
</script>

<style lang="scss" scoped>
    @import '../styles';

    .debug-grid {
        position: absolute;
        top: 0;
        right: 0;
        text-align: right;
        z-index: 10000;
        // width: 100%;

        &.active {
            height: 100%;
            width: 100%;

            .grid {
                display: block;
            }
        }
    }

    form {
        position: relative;
        display: flex;
        flex-direction: row-reverse;
        z-index: 2;
    }

    .grid {
        //background-image: linear-gradient(to bottom, cyan 0, rgba(255,255,255,0) 1px);
        //background-repeat: repeat-y;
        //background-size: 100% 1rem;
        @include debug-vertical-alignment();

        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1000;
        // display: none;
        pointer-events: none;
    }
</style>