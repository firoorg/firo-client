<template>
    <div class="status" v-if="!isLoading">
        <!--<h1 v-if="isLoading">Loading</h1>-->
        <template v-if="isError">
            <div class="icon">
                <send-error />
            </div>
            <h2>An Error occurred!</h2>
            <p>{{ error.message }}</p>
            <em>code {{ error.code }}</em>
        </template>
        <template v-else-if="isValid">
            <div class="icon">
                <successfully-send />
            </div>
            <h2>{{ $t(`${translationNamespace}.title`) }}</h2>
            <p>{{ $t(`${translationNamespace}.description`) }}</p>
        </template>
    </div>
</template>

<script>
    import AutoCloseMixin from '@/mixins/AutoCloseMixin'
    import TranslationNamespaceMixin from '@/mixins/TranslationNamespaceMixin'

    import SendError from '@/components/Icons/SendError'
    import SuccessfullySend from '@/components/Icons/SucessfullySend'

    export default {
        name: 'StepResponseStatus',

        mixins: [
            AutoCloseMixin,
            TranslationNamespaceMixin
        ],

        components: {
            SendError,
            SuccessfullySend
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
        max-width: emRhythm(13);
        margin: emRhythm(-6) auto emRhythm(2);

        & + h2 {
            margin-bottom: 0;
        }
    }

    .status {
        text-align: center;

        p:last-child {
            margin-bottom: 0;
        }
    }
</style>
