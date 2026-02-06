import { simpleDeepClone } from '@utils/clone'
import { CalcComplateData } from '@utils/data-calcs'
import { useSvgStore } from '@store/svg'
import { useDataStore } from '@store/data'

export default class Construct {
    constructor(index, template) {
        this.index = index
        this.template = simpleDeepClone(template)
        this.templateShadw = simpleDeepClone(template)
        this.svgStore = useSvgStore()
        this.dataStore = useDataStore()
    }

    currentData = { data: [] }

    updateCurrentData() {
        const data = CalcComplateData(this.templateShadw)
        this.currentData = data
        return this.currentData
    }

    root = { x: 0, y: 0 }
    center = { x: 0, y: 0 }

    branchOneCollection = new Map()

    mount = null

    panzoom = null

    markNavAim = {
        index: -1,
        name: '',
        update: ({ name, index }) => {
            this.markNavAim.name = name
            this.markNavAim.index = index
        },
        init: () => {
            this.markNavAim.update({
                index: -1,
                name: ''
            })
        }
    }
}