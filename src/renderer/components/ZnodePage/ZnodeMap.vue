<template>
    <section class="znode-map">
        <div class="map">
            <div class="heatmap" ref="heatmap"></div>
            <div class="nodes">
                <div class="node" :style="getNodePositionStyles({ location: { ll: [0,0] } })"></div>
                <div class="node" v-for="(znode, index) of znodes" :style="getNodePositionStyles(znode)"></div>
            </div>
            <world-map class="world-map" />
        </div>
    </section>
</template>

<script>
    import h337 from 'heatmap.js'
    import { debounce } from 'lodash'

    import WorldMap from '@/assets/world-low.svg'
    // import WorldMap from '@/assets/Mercator_Projection.svg'

    export default {
        name: 'ZnodeMap',

        components: {
            WorldMap
        },

        props: {
            znodes: {
                type: Array,
                required: true
            }
        },

        data () {
            return {
                // This also controls the aspect ratio of the projection
                width: 1009,
                height: 651,

                left: -169.6,
                top: 83.68,
                right: 190.25,
                bottom: -55.55,

                // heatmap
                heatmap: null,
                heatmapPoints: [],
                debouncedHeatmapUpdate: this.updateHeatmap
            }
        },

        created () {
            this.debouncedHeatmapUpdate = debounce(() => {
                console.log('triggering updateHeatmap')
                this.updateHeatmap()
            }, 250, {
                maxWait: 750
            })
        },

        mounted () {
            this.heatmap = h337.create({
                container: this.$refs.heatmap,
                blur: 1,
                radius: 40,
                minOpacity: 0,
                maxOpacity: 0.45,
                gradient: {
                    '0': '#23612F',
                    '.4': '#23612F',
                    '.85': '#23B852',
                    '.98': '#59F979'
                }
            })

            this.heatmap.setData({
                data: this.heatmapPoints
            })
        },

        computed: {
            mapLatBottomRad () {
                return this.bottom * Math.PI / 180
            },
            mapLngDelta () {
                return this.right - this.left
            },
            worldMapWidth () {
                return ((this.width / this.mapLngDelta) * 360) / (2 * Math.PI)
            },
            mapOffsetY () {
                return this.worldMapWidth / 2 * Math.log((1 + Math.sin(this.mapLatBottomRad)) / (1 - Math.sin(this.mapLatBottomRad)))
            }
        },

        watch: {
            znodes: {
                handler (newVal, oldVal) {
                    console.log('zcoin handler')
                    this.debouncedHeatmapUpdate()
                },
                immediate: true
            }
        },

        methods: {
            updateHeatmap () {
                const points = []

                this.znodes.forEach((znode) => {
                    const { x, y } = this.getZnodePosition(znode)

                    points.push({
                        x: Math.round(x),
                        y: Math.round(y)
                    })
                })

                this.heatmapPoints = points

                if (!this.heatmap) {
                    return
                }

                this.heatmap.setData({
                    data: points
                })
            },

            getNodeMapPosition (lat, lon) {
                const latitudeRad = lat * Math.PI / 180
                const x = (lon - this.left) * (this.width / this.mapLngDelta)
                const y = this.height - ((this.worldMapWidth / 2 * Math.log((1 + Math.sin(latitudeRad)) / (1 - Math.sin(latitudeRad)))) - this.mapOffsetY)

                // the pixel x,y value of this point on the map image normalized
                return {
                    x: x,
                    y: y
                }
            },

            getZnodePosition (znode) {
                const { location } = znode
                const [ lat, lon ] = location.ll

                return this.getNodeMapPosition(lat, lon)
            },

            getNodePositionStyles (znode) {
                const { x, y } = this.getZnodePosition(znode)

                return {
                    left: `${x / this.width * 100}%`,
                    top: `${y / this.height * 100}%`
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    $worldmap-width: 1009;
    //$worldmap-height: 651;
    //$worldmap-ratio: $worldmap-width / $worldmap-height * 100;

    .znode-map {
        position: relative;
        max-height: 35rem;
        max-width: $worldmap-width * 1px;
        box-sizing: border-box;
        margin: 0 auto;
    }

    .znode-map {
        position: relative;
        //max-height: 35rem;
        box-sizing: border-box;

        .map {
            padding-bottom: 64.51932607%;
            display: block;
            position: relative;
        }
    }

    .heatmap,
    .nodes .node,
    .world-map {
        position: absolute;
        top: 0;
        left: 0;
    }

    .heatmap {
        width: 100%;
        height: 100%;
        position: absolute !important;
        z-index: 3;

        /deep/ canvas {
            width: 100%;
            height: 100%;
        }
    }

    .nodes {
        max-width: $worldmap-width * 1px;
        .node {
            border: 1px solid red;
            z-index: 2;
        }
    }

    .world-map {
        width: 100%;
        height: 100%;
        z-index: 1;

        & /deep/ .land {
            fill: $color--comet-dark-mixed;
            stroke: $color--comet-dark-mixed;
        }
    }
</style>
