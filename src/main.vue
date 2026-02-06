<template>
    <main class="container">
        <!-- 左箭头 -->
        <aside class="arrow-warp">
            <svg class="arrow-icon">
                <polygon id="prevIcon" @click="prev" class="icon" />
            </svg>
        </aside>
        <!-- 中间树 -->
        <section class="center">
            <svg id="screen">
                <the-defs />
            </svg>
        </section>
        <!-- 右箭头 -->
        <aside class="arrow-warp">
            <svg class="arrow-icon">
                <polygon id="nextIcon" @click="next" class="icon" />
            </svg>
        </aside>
    </main>
    <!-- 详情 -->
    <el-dialog v-model="detailpanel.switch" title="详情" width="30%" destroy-on-close center @close="closeDetailpanel">
        <el-form label-width="100px" class="demo-ruleForm">
            <el-form-item label="标题" prop="title">
                <el-input v-model="detailpanel.title" type="textarea" :disabled="true" />
            </el-form-item>
            <el-form-item label="新闻标题" prop="news_title">
                <el-input v-model="detailpanel.news_title" type="textarea" :disabled="true" />
            </el-form-item>
            <el-form-item label="组织" prop="org">
                <el-input v-model="detailpanel.org" type="textarea" :disabled="true" />
            </el-form-item>
            <el-form-item label="人员" prop="pre">
                <el-input v-model="detailpanel.pre" type="textarea" :disabled="true" />
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script setup>
// <!-- <image x="14" y="8.5" preserveAspectRatio="none" xlink:href="@/assets/image/sq.svg" /> -->
import $ from 'jquery'
// store
import { useSvgStore } from '@/store/svg'
import { useDataStore } from '@/store/data'
// mixins
import { SwitchPage } from '@/mixins/switch-page'
import { CenterLine } from './mixins/center-line'
// utils
import { CalcCleanTree } from '@/utils/data-calcs'
import { CLEAN_DATA } from '@/utils/data'
// import Tree from '@/mixins/tree'
import Tree from './mixins/tree/index'
import theDefs from './components/the-defs.vue'

const svgStore = useSvgStore()
const dataStore = useDataStore()

dataStore.data.update(CalcCleanTree(CLEAN_DATA))

const detailpanel = computed(() => dataStore.detailpanel)
const closeDetailpanel = () => {
    dataStore.detailpanel.close()
}


const treeCollection = new Map()

watch(() => dataStore.current.value, () => {
    dataStore.data.update(CalcCleanTree(CLEAN_DATA))
    treeCollection.forEach((tree) => {
        tree.reform()
    })
})

onMounted(() => {
    const screen = $('#screen')
    svgStore.updateSize({
        width: screen.width(),
        height: screen.height()
    })
    SwitchPage()
    CenterLine(svgStore)
    CLEAN_DATA.forEach((_, index) => {
        const tree = new Tree(index)
        tree.init()
        treeCollection.set(index, tree)
    })
})

const prev = () => {
    dataStore.current.update(Math.max(
        0,
        dataStore.current.value - 4
    ))
}

const next = () => {
    dataStore.current.update(Math.min(
        dataStore.current.value + 4,
        dataStore.data.value.length - 1
    ))
}

const include = (index) => {
    return dataStore.current.include(index).is
}

const transform = (index) => {
    const tree = treeCollection.get(index) || {
        trunkRoot: {
            x: 0,
            y: 0
        },
        upper: false
    }
    const { x, y } = tree.trunkRoot
    return tree.upper ? `translate(${x - 40}, ${y - 22})` : `translate(${x - 40}, ${y + 10})`
}
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    width: 100%;
    height: 100vh;
    background: linear-gradient(176deg, #020C1C 0%, #020C1C 100%);
    overflow: hidden;
    .arrow-warp {
        display: flex;
        width: 55px;
        align-items: center;
        justify-content: center;
        .arrow-icon {
            width: 18px;
            height: 34px;
            .icon {
                fill: rgba(144, 215, 255, 0.4);
                stroke: rgba(144, 215, 255, 0.4);
                stroke-width: 1;
                stroke-linecap: round;
                stroke-linejoin: round;
                cursor: pointer;
                &.enable {
                    &:hover {
                        stroke: rgba(144, 215, 255, 0.6);
                        fill: rgba(144, 215, 255, 0.6);
                    }
                    &:active {
                        stroke: rgba(144, 215, 255, 1);
                        fill: rgba(144, 215, 255, 1);
                    }
                }
            }
        }
    }
    .center {
        width: calc(100% - 110px);
        height: inherit;
        #screen {
            width: 100%;
            height: inherit;
        }
    }
}
</style>
