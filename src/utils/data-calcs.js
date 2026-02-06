import { SPAY_DATA, RAW_DATA } from '@/utils/data'
import { simpleDeepClone } from '@/utils/clone'

import { useDataStore } from '@/store/data'

/**
 * 计算树枝所在象限
 * @param {number} index 
 * @param {number} secIndex 
 * @returns 
 */
export const Quadrant = (index = 0, secIndex = 0) => {
    const isUpper = Boolean(index % 2 === 0)
    const isLeft = Boolean(secIndex % 2 === 0)
    if (isUpper) {
        return isLeft ? 2 : 1
    } else {
        return isLeft ? 3 : 4
    }
}

/**
 * 计算clean版数据
 * @param {Array<{
 *      data: Array<{
 *          title:  string
 *      }>
 * }>} dataList 
 */
export const CalcCleanTree = (dataList) => {
    return dataList.map((item, index) => {
        const isLower = Boolean(index % 2)
        let addupLeft = 0, addupRight = 0
        item.data.map((info, secIndex) => {
            /**
             * 所在象限*/
            const quadrant = Quadrant(index, secIndex)
            /**
             * 二级高度
             */
            info.height = 60
            switch (quadrant) {
                case 1:
                case 2:
                    if ([2].includes(quadrant)) {
                        addupLeft += 60
                        if (addupLeft === addupRight) addupLeft += 30
                        info.addup = addupLeft
                    } else {
                        addupRight += 60
                        if (addupLeft === addupRight) addupRight += 30
                        info.addup = addupRight
                    }
                    break
                case 3:
                case 4:
                    if ([0, 1].includes(secIndex)) {
                        addupLeft = 35
                        addupRight = 65
                        info.addup = secIndex === 0 ? addupLeft : addupRight
                        break
                    }
                    if ([3].includes(quadrant)) {
                        addupLeft += 60
                        if (addupLeft === addupRight) addupLeft += 30
                        info.addup = addupLeft
                    } else {
                        addupRight += 60
                        if (addupLeft === addupRight) addupRight += 30
                        info.addup = addupRight
                    }
            }
            return info
        })
        /**
         * 一级高度
         */
        item.height = Math.max(addupLeft, addupRight) + 40
        return item
    })
}

/**
 * 计算阉割版数据
 * @param {number} index 
 * @param {number} secIndex 
 * @param {'get'|'delete'} method 
 */
export const CalcSpayData = (index, secIndex, method = 'get') => {
    const dataStore = useDataStore()
    const newData = simpleDeepClone(dataStore.data.value)[index]
    /**
     * 是否是下边？
     */
    const isLower = Boolean(index % 2)

    newData.data.forEach((info, i) => {
        // 非我具弃
        if (secIndex !== i) {
            info.org = []
            info.pre = []
            return
        }
        // 弃
        if (method === 'delete') {
            info.org = []
            info.pre = []
            return
        }
        // 取
        info.org = SPAY_DATA[index].data[secIndex].org
        info.pre = SPAY_DATA[index].data[secIndex].pre
    })

    let addupLeft = 0, addupRight = 0
    newData.data.map((info, i) => {
        /**
         * 象限 */
        const quadrant = Quadrant(index, i)

        let space = 60
        if (i === secIndex) {
            const length = info.org.length + info.pre.length
            if (method === 'get') {
                space = length * 32 /**每个组织和人员占位 */ + (26/**主枝与第一个附枝间隔 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */) * 2
            } else {
                space = 60
            }
        }
        info.height = space
        switch (quadrant) {
            case 1:
            case 2:
                if ([2].includes(quadrant)) {
                    addupLeft += space
                    if (addupLeft === addupRight) addupLeft += 30
                    info.addup = addupLeft
                } else {
                    addupRight += space
                    if (addupLeft === addupRight) addupRight += 30
                    info.addup = addupRight
                }
                break
            case 3:
            case 4:
                if (i === 0) {
                    info.addup = addupLeft = 35
                    addupLeft += space
                    break
                }
                if (i === 1) {
                    info.addup = addupRight = 65
                    addupRight += space
                    break
                }
                if ([3].includes(quadrant)) {
                    info.addup = addupLeft
                    addupLeft += space
                    if (addupLeft === addupRight) addupLeft += 30
                } else {
                    info.addup = addupRight
                    addupRight += space
                    if (addupLeft === addupRight) addupRight += 30
                }
        }
        return info
    })
    /**
     * 一级高度
     */
    newData.height = Math.max(addupLeft, addupRight) + (isLower ? 0 : 40)
    return newData
}

/**
 * 计算阉割org/pre版数据
 * @param {number} index 
 * @param {number} secIndex 
 * @param {'org' | 'pre'} type 
 * @param {'get' | 'delete'} method 
 * @returns 
 */
export const CalcSpayOrgData = (index, secIndex, name = 'org', method = 'get') => {
    const dataStore = useDataStore()
    const newData = simpleDeepClone(dataStore.data.value)[index]
    /**
     * 是否是下边？
     */
    const isLower = Boolean(index % 2)

    newData.data[secIndex][name] = method === 'get' ? SPAY_DATA[index].data[secIndex][name] : []

    let addupLeft = 0, addupRight = 0
    newData.data.map((info, i) => {
        /**
         * 象限 */
        const quadrant = Quadrant(index, i)
        let space = 60
        if (i === secIndex) {
            length = info.pre.length + info.org.length
            space = length * 32 /**每个组织和人员占位 */ + (26/**主枝与第一个附枝间隔 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */) * 2
        }
        info.height = space
        switch (quadrant) {
            case 1:
                addupRight += space
                if (addupLeft === addupRight) addupRight += 30
                info.addup = addupRight
                break
            case 2:
                addupLeft += space
                if (addupLeft === addupRight) addupLeft += 30
                info.addup = addupLeft
                break
            case 3:
            case 4:
                if (i === 0) {
                    info.addup = addupLeft = 35
                    addupLeft += space
                    break
                }
                if (i === 1) {
                    info.addup = addupRight = 65
                    addupRight += space
                    break
                }
                if ([3].includes(quadrant)) {
                    info.addup = addupLeft
                    addupLeft += space
                    if (addupLeft === addupRight) addupLeft += 30
                } else {
                    info.addup = addupRight
                    addupRight += space
                    if (addupLeft === addupRight) addupRight += 30
                }
        }
        return info
    })
    /**
     * 一级高度
     */
    newData.height = Math.max(addupLeft, addupRight) + (isLower ? 0 : 40)
    return newData
}

/**
 * 展示完全数据
 * @param {number} index 
 * @returns 
 */
export const CalcComplateData = (data) => {
    const newData = simpleDeepClone(data)

    let addupLeft = 0, addupRight = 0
    newData.data.map((info, i) => {
        /**象限 */
        const quadrant = Quadrant(0, i)

        let space = 0
        if (info.org && info.pre) { // 存不存在与长度为空不是一回事
            const length = info.org?.length + info?.pre.length
            space = length * 32 /**每个组织和人员占位 */ + (26/**主枝与第一个附枝间隔 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */) * 2
        } else {
            space = 60
        }

        info.height = space

        if ([2, 3].includes(quadrant)) {
            addupLeft += space
            if (addupLeft === addupRight) addupLeft += 30
            info.addup = addupLeft
        } else {
            addupRight += space
            if (addupLeft === addupRight) addupRight += 30
            info.addup = addupRight
        }

        return info
    })
    // 一级高度
    newData.height = Math.max(addupLeft, addupRight) + 40
    return newData
}