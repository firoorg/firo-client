<template>
    <section class="blockchain">
        <el-progress class="sync-progress"
                     :percentage="progress"
                     :show-text="false"
                     :strokeWidth="2"
                     status="success"></el-progress>
        <div class="status">
            <i class="el-icon-loading"></i>
        </div>
        <div class="network">
            <i class="el-icon-share"></i>
        </div>
    </section>
</template>

<script>
    export default {
        name: 'blockchain',
        data () {
            return {
                progress: Math.floor(Math.random() * 100),
                progressUpdateInterval: null
            }
        },
        created () {
            this.progressUpdateInterval = setInterval(() => {
                this.progress = (this.progress + Math.floor(Math.random() * 20)) % 100
            }, 5000)
        },

        beforeDestroy () {
            if (this.progressUpdateInterval) {
                clearInterval(this.progressUpdateInterval)
            }
        }
    }
</script>

<style lang="scss">
    .blockchain {
        position: relative;
        margin-left: emRhythm(3);
        margin-right: emRhythm(3);

        display: grid;
        grid-template-areas: "progress status network";
        grid-template-columns: auto emRhythm(3) emRhythm(3);
        grid-gap: emRhythm(2);

        &:before {
            $height: 1px;

            content: '';
            position: absolute;
            width: 100%;
            height: $height;
            // background: linear-gradient(to right, $color--lila-dark, $color--lila, $color--lila-dark);
            top:-$height;
            left: 0;
            opacity: 0.2;
        }

        .sync-progress {
            grid-area: progress;
        }

        .el-progress-bar__inner,
        .el-progress-bar__outer{
            border-radius: 0;
        }

        .el-progress-bar__outer {
            background: $color--dark;
        }

        .el-progress-bar__inner {
            background: $gradient--green-bright;
            transition: width 1s ease-out;
        }

        &> div {
            align-self: center;
        }

        .status {
            grid-area: status;
        }

        .network {
            grid-area: network;
        }
    }
</style>