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
                <a
                    v-for="(n, index) in totalPage"
                    :key="index"
                    :class="[css.pageClass, isCurrentPage(n) ? css.activeClass : '']"
                    @click="loadPage(n)"
                    v-html="n"
                />
            </template>
            <template v-else>
                <a
                    v-for="(n, index) in windowSize"
                    :key="index"
                    :class="[css.pageClass, isCurrentPage(windowStart+n-1) ? css.activeClass : '']"
                    @click="loadPage(windowStart+n-1)"
                    v-html="windowStart+n-1"
                />
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
import { VuetablePaginationMixin } from 'vue3-vuetable'

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
    padding-top: 6px;
    text-align: center;
    user-select: none;

}

a {
    display: inline-block;
    color: var(--color-text-primary);
    cursor: pointer;
}

.icon {
    padding: 6px;

    &.disabled {
        cursor: default;
        color: var(--color-text-disabled);
    }
}

.numbers {
    border-radius: 6px;
    overflow: hidden;
    padding: {
        left: 6px;
        right: 6px;
    }
    a {
        padding: 6px;
        color: var(--color-text-secondary);

        &:hover,
        &:focus {
            background: var(--color-background-tag);
        }

        &.active {
            color: var(--color-text-primary);
        }
    }
}
</style>
