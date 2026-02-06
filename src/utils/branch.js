import { Tan } from '@/utils/math'

/**
 * 计算branch 1的path
 * @param {{ x: number, y: number }} start 起点
 * @param {number} offset 长度
 * @returns {string} path
 */
export const BranchOneD = (start, offset, isLeft = true) => {
    const { x, y } = start
    const outerY = y - 25
    const innerY = y - 23
    return isLeft
        ? `M ${x} ${y} Q ${x - Math.min(offset, 20)} ${outerY} ${x - Math.min(offset, 45)} ${outerY} L ${x - offset} ${outerY} ${x - offset} ${innerY} ${x - Math.min(offset, 45)} ${innerY} Q ${x - Math.min(offset, 20)} ${innerY + 2} ${x} ${y + 15}`
        : `M ${x} ${y} Q ${x + Math.min(offset, 20)} ${outerY} ${x + Math.min(offset, 45)} ${outerY} L ${x + offset} ${outerY} ${x + offset} ${innerY} ${x + Math.min(offset, 45)} ${innerY} Q ${x + Math.min(offset, 20)} ${innerY + 2} ${x} ${y + 15}`
}

/**
 * 计算branch 2 的 points
 * @param {{x: number, y: number}} start 起点
 * @param {number} offset 长度
 * @param {number} isUpper 属于上/下
 * @returns {string} points
 */
export const BranchTwoPoints = (start, offset, isUpper = true) => {
    const { x, y } = start
    const left = `${x - 2} ${y}`
    const right = `${x + 2} ${y}`
    const middle = `${x + (isUpper ? -offset : offset) / Tan(75)} ${y + offset}`
    return `${left}, ${middle}, ${right}`
}

/**
 * 计算branch-org/pre 的 d
 * @param {{x: number, y: number}} start 起点
 * @param {number} offset 长度
 * @param {1|2|3|4} quadrant 区间
 * @returns {string} path
 */
export const BranchOrgD = (start, offset, quadrant) => {
    const { x, y } = start
    let [outerY, innerY] = [y + 16, y + 15]
    let path = ''
    switch (quadrant) {
        case 1:
        case 4:
            path = `M ${x} ${y} Q ${x + 10} ${outerY} ${x + Math.min(offset, 30)} ${outerY} L ${x + offset} ${outerY} ${x + offset} ${innerY} ${x + Math.min(offset, 30)} ${innerY} Q ${x + 10} ${innerY} ${x + 5} ${y - 2}`
            break
        case 2:
        case 3:
            path = `M ${x} ${y} Q ${x - 10} ${outerY} ${x - Math.min(offset, 30)} ${outerY} L ${x - offset} ${outerY} ${x - offset} ${innerY} ${x - Math.min(offset, 30)} ${innerY} Q ${x - 14} ${innerY} ${x - 5} ${y + 2}`
            break
    }
    return path
}

/**
 * 计算branch-org/pre的trunk
 * @param {{x: number, y: number}}} start 
 * @param {number} offset 
 * @param {number} isUpper 
 * @returns {string}
 */
export const BranchOrgTrunkPoints = (start, offset, isUpper = true) => {
    const { x, y } = start
    const left = `${x - 2} ${y}`
    const right = `${x + 2} ${y}`
    const middle = `${x + (isUpper ? -offset : offset) / Tan(75)} ${y + offset}`
    return `${left},${middle},${right}`
}

export const BranchsOfOrgD = (start, offset, quadrant) => {
    const { x, y } = start
    let path = ''
    switch (quadrant) {
        case 1:
        case 4:
            path = `M ${x} ${y} Q ${x + 2} ${y + 17} ${x + Math.min(17, offset)} ${y + 17} L ${x + offset} ${y + 17} ${x + offset} ${y + 18} ${x + Math.min(17, offset)} ${y + 18} Q ${x + 3} ${y + Math.min(19, offset)} ${x} ${y + 7}`
            break
        case 2:
        case 3:
            path = `M ${x} ${y} Q ${x - 2} ${y + 17} ${x - Math.min(17, offset)} ${y + 17} L ${x - offset} ${y + 17} ${x - offset} ${y + 18} ${x - Math.min(17, offset)} ${y + 18} Q ${x - 3} ${y + Math.min(19, offset)} ${x} ${y + 7}`
            break
    }
    return path
}
/**
 * tail 的points
 * @param {{x:number, y:number}} start 
 * @param {number} offset 
 * @returns 
 */
export const TailPoints = (start, offset) => {
    const [x, y] = [Math.ceil(start.x), Math.ceil(start.y)]
    return `${x} ${y - 3},${x} ${y + 3},${x - offset} ${y}`
}