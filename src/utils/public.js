/**
 * 创建svg元素
 * @param {string} name 
 * @returns {SVGAElement}
 */
window.document.createSvgElement = (name) => document.createElementNS('http://www.w3.org/2000/svg', name)