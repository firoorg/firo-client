<template>
    <main>
        <div class="container">
            <zcoin-logo class="logo" />
            <div class="txt">
                <h2>Zcoin is shutting down</h2>
                <p>Do not shut down the computer until  this window disappears.</p>
            </div>
        </div>
    </main>
</template>

<script>
import ZcoinLogo from '@/components/Icons/ZcoinLogo'

export default {
    name: 'WaitForDaemon',
    components: {
        ZcoinLogo
    }
}
</script>

<style lang="scss" scoped>
    main {
        height: 100vh;
        box-sizing: border-box;
        text-align: center;
        color: $color--white;
        padding: emRhythm(4);

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        .logo {
            height: emRhythm(8);
            margin-bottom: emRhythm(5);
        }

        h2 {
            padding-top: 0;
            color: $color--white-light;
            margin-bottom: emRhythm(2, $ms-up2);
        }

        p {
            @include font-medium();
            font-style: italic;
        }
        /*
        padding: emRhythm(6) 0;
        height: 100vh;
        box-sizing: border-box;
        cursor: default;
        color: $color--polo-light;
        */
        user-select: none;
        -webkit-app-region: drag;
    }
</style>
