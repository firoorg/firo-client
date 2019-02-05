<template>
    <div class="field">
        <label>
            {{ $t('settings.form.privacy.label__connect-via-tor') }}
        </label>
        <span class="description">
            {{ $t('settings.form.privacy.description__connect-via-tor') }}
        </span>
        <div class="control">
            <base-checkbox
                v-model="connectViaTor"
                size="large"
                color="green"
            >
                <template slot-scope="{ isChecked }">
                    {{ $t(`settings.form.privacy.label__connect-via-tor--${isChecked ? 'checked' : 'unchecked'}`) }}
                </template>
            </base-checkbox>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ConnectViaTorSettings',

    data () {
        return {
            connectViaTor: false
        }
    }
}
</script>

<style lang="scss" scoped>
.control {
    max-width: 30rem;
    margin-top: emRhythm(1);
}
</style>
