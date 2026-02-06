import $ from 'jquery'

const SWITCH_ICON_CONFIG = {
    stroke: 6,
    w: 10,
    h: 32
}
export const SwitchPage = () => {
    const { stroke, w, h } = SWITCH_ICON_CONFIG
    const prevIcon = $('#prevIcon').attr('points', `0 ${h / 2}, ${w} 0,${w + stroke} 0, ${w} ${h / 2}, ${w + stroke} ${h}, ${w} ${h}, 0 ${h / 2}`)
    const nextIcon = $('#nextIcon').attr('points', `0 0, ${stroke} 0, ${w + stroke} ${h / 2},${stroke} ${h}, 0 ${h}, ${stroke} ${h / 2}, 0 0`)
}