<template>
    <svg
        height="16"
        viewBox="0 0 16 16"
        width="16"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g
            fill="none"
            fill-rule="evenodd"
            :stroke="strokeColor"
            stroke-linecap="round"
            stroke-width="2"
        >
            <path d="m13 3 -10 10" />
            <path d="m3 3 10 10" />
            <!--
            <path d="m13 3-10 10" transform="matrix(-1 0 0 1 16 0)" />
            -->
            <!--
            <path d="m11.7781746 4-7.7781746 7.7781746" />
            <path
                d="m11.7781746 4-7.7781746 7.7781746"
                transform="matrix(-1 0 0 1 15.778174 0)"
            />
            -->
        </g>
    </svg>
</template>

<script>
import IconColorMixin from '@/mixins/IconColorMixin'

export default {
    name: 'TickIcon',
    mixins: [IconColorMixin]
}
</script>
