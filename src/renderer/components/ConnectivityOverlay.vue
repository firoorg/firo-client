<template>
    <section class="connectivity-overlay overlay centered">
        <div class="grid">
            <main class="content">
                <header>
                    <Warning class="status" :has-shadow="true" />
                    <h1>Connection to the<br>Zcoin Deamon lost!</h1>
                </header>

                <p>Maecenas sed diam eget risus varius blandit sit amet non magna. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum</p>
                <p> Vestibulum id ligula porta felis euismod semper.</p>

                <footer>
                    <BaseButton color="red" is-dark is-outline @click="closeApp">Quit Zcoin</BaseButton>
                    <BaseButton>Restart Daemon</BaseButton>
                </footer>
            </main>
        </div>
    </section>
</template>

<script>
    import Warning from '@/components/Icons/Warning'

    export default {
        name: 'connectivity-overlay',
        components: {
            Warning
        },
        methods: {
            closeApp () {
                console.log('closing app')
                window.close()
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import '../styles';

    .connectivity-overlay {
    }

    .status {
        text-align: center;
        font-size: emRhythm(20);
        color: $color--polo-medium;
        display: inline-block;
    }
</style>