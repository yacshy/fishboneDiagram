/**
 * 简单深克隆
 * @param {Object} obj 
 * @returns {Object}
 */
export const simpleDeepClone = (obj) => JSON.parse(JSON.stringify(obj))