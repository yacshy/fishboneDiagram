import $ from 'jquery'
import { useSvgStore } from '@/store/svg'
/**
 * 中线
 * @param {Store} svgStore 
 */
export const CenterLine = () => {
    const svgStore = useSvgStore()
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    const { width, height } = svgStore.size
    const middle = Math.ceil(height / 2)
    $(polygon)
        .attr('points', `0 ${middle - 1}, ${width} ${middle - 1}, ${width} ${middle + 1}, 0 ${middle + 1}, 0 ${middle - 1}`)
        .css({
            fill: '#254373'
        })
        .appendTo('#screen')
}