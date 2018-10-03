<template>
    <section class="znode-map">
        <div class="map">
            <div class="heatmap" ref="heatmap"></div>
            <div class="nodes">
                <div class="node" :style="getNodePositionStyles({ location: { ll: [0,0] } })"></div>
                <!--<div class="node" v-for="(znode, index) of remoteZnodes" :style="getNodePositionStyles(znode)">
                    <span>1</span>
                </div>-->
                <div v-for="(cluster) of myZnodeClusters"
                     class="cluster-wrap"
                     :style="getClusterPositionStyles(cluster.position)"
                     :key="cluster.id">
                    <base-popover :open="false"
                                  placement="left-auto"
                                  :popover-class="[ cluster.statusClass, 'dark' ]"
                                  boundaries-element="boundariesElement"
                                  class="my-znode-popover"
                                  trigger="hover">
                        <template slot="target">
                            <div class="cluster" :class="{ 'has-multiple': cluster.isCluster }">
                                <span>{{ cluster.amount }}</span>
                            </div>
                        </template>
                        <template slot="content">
                            <ul>
                                <li v-for="znode of cluster.nodes">{{ znode.id }}</li>
                            </ul>
                        </template>
                    </base-popover>
                </div>
            </div>
            <world-map class="world-map" />
        </div>
    </section>
</template>

<script>
    import h337 from 'heatmap.js'
    import supercluster from 'supercluster'
    import { debounce } from 'lodash'

    import WorldMap from '@/assets/world-low.svg'
    // import WorldMap from '@/assets/Mercator_Projection.svg'

    export default {
        name: 'ZnodeMap',

        components: {
            WorldMap
        },

        props: {
            remoteZnodes: {
                type: Array,
                required: true
            },
            myZnodes: {
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
                heatmapPointsMax: 1,
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
                blur: 0.5,
                radius: 35,
                minOpacity: 0,
                maxOpacity: 0.6,
                /*
                gradient: {
                    '0': '#23622F',
                    '.2': '#23622F',
                    '.4': '#23843D',
                    '.6': '#23A74B',
                    '.8': '#2EC55A',
                    '.95': '#43DF69',
                    '1': '#58F878'
                },
                */
                gradient: {
                    // '0': '#23A74B',
                    '0': '#1F1F2E',
                    '1': '#1F1F2E'
                    // '1': '#58F878'
                }
            })

            this.heatmap.setData({
                max: this.heatmapPointsMax,
                data: this.heatmapPoints
            })

            console.log('this.myZnodeClusters', this.myZnodeClusters)
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
            },

            /*
            myZnodeMapItems () {
                const clusters = this.myZnodeClusters()
            },
            */

            myZnodeClusters () {
                const znodes = {}
                const index = supercluster({
                    radius: 30
                })

                const myNodes = this.myZnodes.map((znode) => {
                    // const { x, y } = this.getZnodePosition(znode)
                    const { lat, lon } = this.getZnodeLatLon(znode)
                    znodes[znode.id] = znode

                    return {
                        znodeId: znode.id,
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [lon, lat]
                        },
                        properties: {
                            cluster: false
                        }
                    }
                })

                console.log('myNodes', myNodes)

                index.load(myNodes)

                const clusters = index.getClusters([
                    this.left,
                    this.bottom,
                    this.right,
                    this.top
                ], 1)

                clusters.forEach((cluster) => {
                    const { id } = cluster

                    if (!id) {
                        return
                    }

                    console.log('cluster children', index.getLeaves(id))
                })

                return clusters.map((cluster) => {
                    const { properties } = cluster
                    const { cluster: isCluster, cluster_id: clusterId } = properties

                    const [ lon, lat ] = cluster.geometry.coordinates

                    let position = { lat, lon }
                    let nodes = []

                    if (isCluster) {
                        nodes = index.getLeaves(clusterId).map(({ znodeId }) => znodes[znodeId])
                    } else {
                        nodes = [
                            znodes[cluster.znodeId]
                        ]
                    }

                    return {
                        id: isCluster ? clusterId : cluster.znodeId,
                        isCluster,
                        position,
                        nodes,
                        amount: nodes.length,
                        __old: cluster
                    }
                })
            }
        },

        watch: {
            remoteZnodes: {
                handler (newVal, oldVal) {
                    console.log('zcoin handler')
                    this.debouncedHeatmapUpdate()
                },
                immediate: true
            }
        },

        methods: {
            updateHeatmap () {
                const gridSize = 25
                const randomSize = gridSize * 0.15
                const grid = {}
                const points = []

                const updateGrid = (x, y) => {
                    const gridX = Math.round(x / gridSize)
                    const gridY = Math.round(y / gridSize)
                    const gridKey = `${gridX}-${gridY}`

                    if (!grid[gridKey]) {
                        grid[gridKey] = 0
                    }

                    grid[gridKey]++
                }

                this.remoteZnodes.forEach((znode) => {
                    const { x, y } = this.getZnodePosition(znode)

                    updateGrid(x, y)

                    for (let i = 0, l = Math.random() * 10; i < l; i++) {
                        points.push({
                            x: Math.round(x + Math.random() * randomSize - (randomSize / 2)),
                            y: Math.round(y + Math.random() * randomSize - (randomSize / 2)),
                            value: Math.random() * (10 - l)
                        })
                    }
                })

                const gridValues = Object.values(grid)
                this.heatmapPointsMax = gridValues[0]

                // todo add radius / 2 padding to the heatmap by mapping over the points here
                this.heatmapPoints = points

                if (!this.heatmap) {
                    return
                }

                this.heatmap.setData({
                    // max: this.heatmapPointsMax,
                    data: this.heatmapPoints
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

            getZnodeLatLon (znode) {
                const { location } = znode
                if (!location) {
                    return {
                        lat: 0,
                        lng: 0
                    }
                }
                const [ lat, lon ] = location.ll

                return {
                    lat,
                    lon
                }
            },

            getZnodePosition (znode) {
                const { lat, lon } = this.getZnodeLatLon(znode)
                return this.getNodeMapPosition(lat, lon)
            },

            getNodePositionStyles (znode) {
                const { x, y } = this.getZnodePosition(znode)

                return {
                    left: `${x / this.width * 100}%`,
                    top: `${y / this.height * 100}%`
                }
            },

            getClusterPositionStyles ({ lat, lon }) {
                const { x, y } = this.getNodeMapPosition(lat, lon)

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
        // max-height: 35rem;
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
    .nodes .cluster-wrap,
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

        .cluster-wrap {
            z-index: 4;
        }

        .cluster {
            $dim: .75rem;
            min-width: $dim;
            min-height: $dim;
            margin-top: -$dim / 2;
            margin-left: -$dim / 2;
            border-radius: 50%;
            background: $gradient--green-bright;
            cursor: pointer;

            span {
                display:inline-block;

                padding-top: 50%;
                padding-bottom: 50%;
                margin-left: emRhythm(1);
                margin-right: emRhythm(1);
                pointer-events: none;

                @include font-heavy();

                display: none;
            }

            &.has-multiple {
                display:inline-block;
                line-height: 0;
                //margin-top: -50%;
                margin-left: -50%;
                transform: translate(0, -48%);
                overflow: visible;

                span {
                    display: block;
                }
            }
        }

        .node {
            //border: 1px solid red;
            z-index: 4;
            width: 1rem;
            height: 1rem;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            @include font-black();
            background: $gradient--green-bright;
        }
    }

    .world-map {
        width: 100%;
        height: 100%;
        z-index: 1;

        & /deep/ .land {
            $color: mix($color--comet-dark, $color--comet-dark-mixed);

            fill: $color;
            stroke: $color;
        }
    }
</style>
