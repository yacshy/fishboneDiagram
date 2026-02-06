/**
 * 封装requestAnimationFrame
 * @param {number} current 
 * @param {number} target 
 * @param {Function} callback 
 * @param {number} step 步长
 */
export const Raf = async (current, target, callback, step = 5) => {
    return new Promise((resolve, reject) => {
        try {
            if (target > current) {
                IncreaseRaf(current, target, callback, step).then(resolve)
            } else {
                ReduceRaf(current, target, callback, step).then(resolve)
            }
        } catch (err) {
            reject(err)
            throw new Error(err)
        }
    })
}

const ReduceRaf = async (current, min, callback, step) => {
    return new Promise((resolve) => {
        let offset = current
        const helper = () => {
            offset = Math.max(offset - step, min)
            const res = callback(offset)
            if (offset <= min) {
                cancelAnimationFrame(raf)
                resolve(res)
            } else {
                raf = requestAnimationFrame(helper)
            }
        }
        let raf = requestAnimationFrame(helper)
    })
}

const IncreaseRaf = (current, max, callback, step) => {
    return new Promise((resolve) => {
        const helper = () => {
            offset = Math.min(offset + step, max)
            const res = callback(offset)
            if (offset >= max) {
                cancelAnimationFrame(raf)
                resolve(res)
            } else {
                raf = requestAnimationFrame(helper)
            }
        }
        let offset = current
        let raf = requestAnimationFrame(helper)
    })
}