<template>
    <section class="restarting-overlay overlay centered">
        <div class="grid">
            <main class="content">
                <div class="icon">
                    <loading-bounce
                        color="dark"
                        class="bounce"
                    />
                </div>
                <div class="wrap">
                    <header>
                        <!--
                        <h1>{{ $t('overlay.error.connection-lost.title') }}</h1>
                        -->
                        <h2>{{ $t('overlay.restarting.title') }}</h2>
                    </header>

                    <p>{{ $t('overlay.restarting.description') }}</p>
                </div>
            </main>
        </div>
    </section>
</template>

<script>
import LoadingBounce from '@/components/Icons/LoadingBounce'

export default {
    name: 'RestartingOverlay',
    components: {
        LoadingBounce
    }
}
</script>

<style lang="scss" scoped>
    .restarting-overlay {
        &.overlay {
            background-color: transparent;
        }

        .content {
            background: $color--comet-dark-mixed;
            padding: emRhythm(4);
            border-radius: 0.25rem;
            @include glow-small-box();

            display: flex;
            align-items: center;

            .wrap {
                margin-left: emRhythm(1);
                margin-right: emRhythm(3);
                text-align: left;
            }

            .icon {
                $dim: emRhythm(12);
                width: $dim;
                height: $dim;
            }

            .bounce {
                $dim: emRhythm(6);
                width: $dim;
                height: $dim;
                margin-top: emRhythm(3);
                margin-left: emRhythm(3);
            }

            h2 {
                //margin: 0 0 emRhythm(2, $ms-up2);
            }

            p:last-of-type {
                margin-bottom: 0;
            }
        }

        h2 {
            margin: 0;
            padding: 0;
        }

        header {
            margin-bottom: 0;
        }
    }
</style>
