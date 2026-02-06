import { useSvgStore } from '@/store/svg'
import { useDataStore } from '@/store/data'
import { useTreeStore } from '@/store/tree'

export default class TreeConstruct {
    constructor(index) {
        this.index = index
        this.upper = Boolean(this.index % 2 === 0)
        /**
         * seed的位置
         */
        this.seedRoot = { x: 0, y: 0 }
        /**
         * 树干的起点
         */
        this.trunkRoot = { x: 0, y: 0 }
        this.svgStore = useSvgStore()
        this.dataStore = useDataStore()
        this.treeStore = useTreeStore()
    }

    get info() {
        return this.dataStore.data.value[this.index]
    }
    get include() {
        return this.dataStore.current.include(this.index)
    }
    get lastNeighbor() {
        return this.dataStore.current.lastNeighbor(this.index)
    }
    get nextNeighbor() {
        return this.dataStore.current.nextNeighbor(this.index)
    }
    get lastLongNeighbor() {
        return this.index < this.dataStore.current.value - 3
    }
    get nextLongNeighbor() {
        return this.index > this.dataStore.current.value + 3
    }
}