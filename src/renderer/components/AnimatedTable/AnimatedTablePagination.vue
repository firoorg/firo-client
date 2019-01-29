<template>
    <div
        v-show="tablePagination && tablePagination.last_page > 1"
        :class="[css.wrapperClass, theme]"
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
            cursor: default;
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

    .pagination.dark {
        a {
            color: $color--comet-medium;
            color: blue;
        }

        .icon {
            &:not(.disabled) {
                color: $color--dark;
                //color: $color--comet;

                &:hover,
                &:focus {
                    color: $color--white;
                    //color: $color--dark;
                }
            }

            &.disabled {
                color: $color--comet-dark-mixed;
            }
        }

        .numbers {
            background: $color--comet-dark-mixed;

            a {
                color: mix($color--comet-dark, $color--comet);

                &:hover,
                &:focus {
                    background: $color--comet-medium;
                    color: $color--dark;
                }

                &.active {
                    background: $color--comet-light;
                    color: $color--dark;
                }
            }
        }
    }
</style>
