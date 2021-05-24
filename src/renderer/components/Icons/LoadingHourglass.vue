<template>
    <div class="loader">
        <div class="top"></div>
        <div class="bottom"></div>
        <div class="line"></div>
    </div>
</template>

<script>
export default {
    name: "LoadingHourglass"
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/colors";

.loader {
    background-color: var(--firo-old-brick);
    animation: loader 5s cubic-bezier(.8,0,.2,1) infinite;
    height: 40px;
    width: 41px;
    position: absolute;
    top:calc(50% - 20px);
    left:calc(50% - 20px);
}

@keyframes loader {
    90% { transform: rotate(0deg); }
    100% { transform: rotate(180deg); }
}

.top {
    animation: top 5s linear infinite;
    border-top: 20px solid #fff;
    border-right: 20px solid transparent;
    border-left: 20px solid transparent;
    height: 0;
    width: 1px;
    transform-origin: 50% 100%;
}

@keyframes top {
    90% { transform: scale(0); }
    100% { transform: scale(0);}
}

.bottom {
    animation: bottom 5s linear infinite;
    border-right: 20px solid transparent;
    border-bottom: 20px solid #fff;
    border-left: 20px solid transparent;
    height: 0;
    width: 1px;
    transform: scale(0);
    transform-origin: 50% 100%;
}

@keyframes bottom {
    10% { transform: scale(0); }
    90% { transform: scale(1); }
    100% { transform: scale(1); }
}

.line {
    animation: line 5s linear infinite;
    border-left: 1px dotted #fff;
    height: 0;
    width: 0;
    position: absolute;
    top: 20px;
    left: 20px;
}

@keyframes line {
    10% { height: 20px; }
    100% { height: 20px; }
}
</style>