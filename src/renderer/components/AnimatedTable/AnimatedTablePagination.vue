<template>
    <div
        v-show="tablePagination && tablePagination.last_page > 1"
        class="pagination"
        :class="css.wrapperClass"
    >
        <a
            :class="[css.linkClass, isOnFirstPage ? css.disabledClass : '']"
            @click="loadPage(1)"
        >
            &laquo;
        </a>
        <a
            :class="[css.linkClass, isOnFirstPage ? css.disabledClass : '']"
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
            :class="[css.linkClass, isOnLastPage ? css.disabledClass : '']"
            @click="loadPage('next')"
        >
            &rsaquo;&nbsp;
        </a>
        <a
            :class="[css.linkClass, isOnLastPage ? css.disabledClass : '']"
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
        css: {
            type: Object,
            default: () => ({
                wrapperClass: 'ui right floated pagination menu',
                activeClass: 'active',
                disabledClass: 'disabled',
                pageClass: 'item',
                linkClass: 'icon',
                paginationClass: 'ui bottom attached segment grid',
                paginationInfoClass: 'left floated left aligned six wide column',
                dropdownClass: 'ui search dropdown'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: emRhythm(5);
        text-align: center;

    }
    a {
        display: inline-block;
        color: $color--comet;
        @include font-heavy();
        cursor: pointer;
    }

    .icon {
        @include setType(1, $ms-up1);
        padding: emRhythm(0.5, $silent: true) emRhythm(0.5, $silent: true);

        &:not(.disabled) {
            color: $color--comet;

            &:hover,
            &:focus {
                color: $color--dark;
            }
        }

        &.disabled {
            color: $color--comet-medium;
        }
    }

    .numbers {
        background: $color--white-light;
        border-radius: emRhythm(1);
        overflow: hidden;
        margin-left: emRhythm(1.5, $silent: true);
        margin-right: emRhythm(1.5, $silent: true);

        a {
            padding: emRhythm(0.5, $silent: true) emRhythm(1.5, $silent: true);
            color: $color--polo;

            &:hover,
            &:focus {
                background: $color--white;
                color: $color--polo-dark;
            }

            &.active {
                background: $color--polo;
                color: $color--white;
            }
        }
    }
</style>