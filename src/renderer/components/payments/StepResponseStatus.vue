<template>
    <div class="status" v-if="!isLoading">
        <!--<h1 v-if="isLoading">Loading</h1>-->
        <template v-if="isError">
            <div class="icon">
                <send-confirmation-check />
            </div>
            <h2>TYPE failed! </h2>
            <p>{{ error.message }}</p>
            <em>code {{ error.code }}</em>
        </template>
        <template v-else-if="isValid">
            <div class="icon">
                <send-confirmation-check />
            </div>
            <h2>TYPE successfully sent!</h2>
        </template>
    </div>
</template>

<script>
    import SendConfirmationCheck from '@/components/Icons/SendConfirmationCheck'
    import AutoCloseMixin from '@/mixins/AutoCloseMixin'

    export default {
        name: 'StepResponseStatus',

        mixins: [
            AutoCloseMixin
        ],

        components: {
            SendConfirmationCheck
        },

        props: [
            'isLoading',
            'isValid',
            'isError',
            'error'
        ]
    }
</script>

<style lang="scss" scoped>
    .icon {
        max-width: emRhythm(15);
        margin: 0 auto emRhythm(2);

        & + h2 {
            margin-bottom: 0;
        }
    }

    .status {
        text-align: center;
    }
</style>
