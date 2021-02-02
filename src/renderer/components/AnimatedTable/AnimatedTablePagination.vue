<template>
    <div
        v-show="tablePagination && tablePagination.last_page > 1"
        :class="[css.wrapperClass, theme]"
    >
        <a
            :class="['first-page-link', css.linkClass, isOnFirstPage ? css.disabledClass : '']"
            @click="loadPage(1)"
        >
            &laquo;
        </a>
        <a
            :class="['prev-page-link', css.linkClass, isOnFirstPage ? css.disabledClass : '']"
            @click="loadPage('prev')"
        >
            &nbsp;&lsaquo;
        </a>
        <div class="numbers">
            <template v-if="notEnoughPages">
                <template v-for="(n, index) in totalPage">
                    <a
                        :key="index"
                        :class="[css.pageClass, isCurrentPage(n) ? css.activeClass : '']"
                        @click="loadPage(n)"
                        v-html="n"
                    />
                </template>
            </template>
            <template v-else>
                <template v-for="(n, index) in windowSize">
                    <a
                        :key="index"
                        :class="[css.pageClass, isCurrentPage(windowStart+n-1) ? css.activeClass : '']"
                        @click="loadPage(windowStart+n-1)"
                        v-html="windowStart+n-1"
                    />
                </template>
            </template>
        </div>
        <a
            :class="['next-page-link', css.linkClass, isOnLastPage ? css.disabledClass : '']"
            @click="loadPage('next')"
        >
            &rsaquo;&nbsp;
        </a>
        <a
            :class="['last-page-link', css.linkClass, isOnLastPage ? css.disabledClass : '']"
            @click="loadPage(totalPage)"
        >
            &raquo;
        </a>
    </div>
</template>

<script>
import { VuetablePaginationMixin } from 'vuetable-2'

export default {
    name: 'AnimatedTablePagination',

    mixins: [VuetablePaginationMixin],

    props: {
        theme: {
            type: String,
            default: ''
        },
        css: {
            type: Object,
            default: () => ({
                wrapperClass: 'pagination',
                activeClass: 'active',
                disabledClass: 'disabled',
                pageClass: 'item',
                linkClass: 'icon',
                paginationClass: '',
                paginationInfoClass: '',
                dropdownClass: ''
            })
        }
    }
}
</script>

<style lang="scss" scoped>
@import "src/renderer/styles/colors";
@import "src/renderer/styles/sizes";

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: $size-tiny-space;
    text-align: center;
    user-select: none;

}

a {
    display: inline-block;
    color: $color-text;
    cursor: pointer;
}

.icon {
    padding: $size-tiny-space;

    &.disabled {
        cursor: default;
        color: $color-text-disabled;
    }
}

.numbers {
    background: lighten($color-main-background, 20%);
    border-radius: $size-tiny-space;
    overflow: hidden;
    padding: {
        left: $size-tiny-space;
        right: $size-tiny-space;
    }
    a {
        padding: $size-tiny-space;
        color: $color-text;

        &:hover,
        &:focus {
            background: $color-input-background;
        }

        &.active {
            background: darken($color-main-background, 5%);
        }
    }
}
</style>
