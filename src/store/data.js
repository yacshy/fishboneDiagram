import { defineStore } from 'pinia'

import { useSvgStore } from './svg'

import { RAW_DATA, SPAY_DATA, CLEAN_DATA } from '@/utils/data'
import { simpleDeepClone } from '@/utils/clone'

export const useDataStore = defineStore('data', () => {
    const svgStore = useSvgStore()

    let detail = reactive({
        value: [],
        update(detail) {
            this.value = detail
        }
    })

    let detailpanel = reactive({
        switch: false,
        org: [],
        pre: [],
        title: '',
        news_title: '',
        show({ org, pre, title, news_title }) {
            this.switch = true
            this.org = org
            this.pre = pre
            this.title = title
            this.news_title = news_title
        },
        close() {
            this.switch = false
            this.org = []
            this.pre = []
            this.title = ''
            this.news_title = ''
        }
    })

    let current = reactive({
        value: 0,
        update(value) {
            this.value = value
        },
        include(index) {
            return {
                is: this.value <= index && index <= this.value + 3,
                distence: index - this.value
            }
        },
        lastNeighbor(index) {
            return {
                is: this.value - 4 <= index && index < this.value,
                distence: this.value - index
            }
        },
        nextNeighbor(index) {
            return {
                is: this.value + 3 < index && index <= this.value + 7,
                distence: index - this.value
            }
        }
    })

    const data = reactive({
        value: [],
        /**
         * 更新全部
         * @param {Array<Object>} newData 
         */
        update(newData) {
            this.value = newData
        },
        /**
         * 更新局部
         * @param {number} index 
         * @param {Object} info 
         */
        updatePart(index, info) {
            this.value.splice(index, 1, info)
        }
    })

    return {
        current,
        data,
        detail,
        detailpanel
    }
})