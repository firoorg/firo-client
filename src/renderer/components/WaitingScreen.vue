<template>
    <div class="waitingScreen">
        <div class="inner">
            <div class="logo">
                <ZcoinLogo />
            </div>

            <div class="waiting">
                <span class="bounce">
                    <LoadingBounce color="green" />
                </span>

                <span class="header-text">
                    Just a Moment...
                </span>
            </div>

            <div class="reason">
                {{ reason }}
            </div>
        </div>
    </div>
</template>

<script>
import LoadingBounce from '@/components/Icons/LoadingBounce';
import ZcoinLogo from '@/components/Icons/ZcoinLogo';

export default {
    name: "WaitingScreen",

    components: {
        LoadingBounce,
        ZcoinLogo
    },

    props: {
        reason: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped lang="scss">
.waitingScreen {
    // Make the component full-screen.
    height: 100%;
    width: 100%;
    position: fixed;
    z-index: 40075000;
    left: 0;
    top: 0;
    overflow-x: hidden; /* Disable horizontal scroll */

    background-color: $color--comet-dark;

    .inner {
        // Center .inner horizontally and vertically.
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        .logo {
            margin: auto;
            height: emRhythm(20);
            width: emRhythm(20);
        }

        .waiting {
            height: min-content;
            color: $color--green;

            .bounce, .header-text {
                display: inline-block;
            }

            .header-text {
                margin-left: emRhythm(1);
                font-size: emRhythm(7);
            }
        }

        .reason {
            text-align: center;
            font-style: italic;
            color: $color--comet-light;
            font-size: emRhythm(3);
        }
    }
}
</style>